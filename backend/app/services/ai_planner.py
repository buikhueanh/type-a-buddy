import json
from datetime import datetime, timedelta, timezone

from google import genai

from ..config import require_gemini_api_key
from ..core.constants import GEMINI_MODEL_NAME, GEMINI_FALLBACK_MODEL_NAMES
from ..schemas.plans import PlanningRequest, Plan


client = genai.Client(api_key=require_gemini_api_key())


class PlanningInputError(ValueError):
    pass


class ModelUnavailableError(RuntimeError):
    pass


class ModelOutputError(RuntimeError):
    pass


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def tz_from_utc_offset_minutes(utc_offset_minutes: int | None) -> timezone:
    offset = utc_offset_minutes or 0
    if offset < -14 * 60 or offset > 14 * 60:
        raise PlanningInputError("utc_offset_minutes must be between -840 and 840")
    return timezone(timedelta(minutes=offset))


def _is_transient_model_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    transient_markers = [
        "503",
        "unavailable",
        "429",
        "resource_exhausted",
        "rate limit",
        "timeout",
        "timed out",
        "temporar",
        "deadline exceeded",
    ]
    return any(m in msg for m in transient_markers)


def build_plan_prompt(
    payload: PlanningRequest,
    start_at: datetime,
    deadline_at: datetime,
    planning_days: int,
    estimated_total_capacity_hours: float,
) -> str:
    return f"""
You are a planning assistant.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations.
Do not include code fences.

The JSON must match this exact structure:

{{
  "goal_summary": "string",
    "start_at": "YYYY-MM-DDTHH:MM:SS±HH:MM",
    "deadline_at": "YYYY-MM-DDTHH:MM:SS±HH:MM",
  "hours_available_per_day": number,
  "days": [
    {{
      "date": "YYYY-MM-DD",
      "items": [
        {{
          "title": "string",
          "duration_hours": number,
          "notes": "string or null"
        }}
      ]
    }}
  ]
}}

Rules:
1. Each day must contain at least one item.
2. The sum of duration_hours for any one day must not exceed hours_available_per_day.
3. The plan must fit between start_at and deadline_at.
4. Spread the work realistically across the available days.
5. Never return empty titles.
6. Keep the plan concise and practical.
7. notes may be null if not needed.
8. The first day.date MUST equal the local calendar date of start_at.
9. Use the same timezone offsets as start_at and deadline_at.

User goal:
{payload.goal}

Planning inputs:
start_at: {start_at.isoformat()}
deadline_at: {deadline_at.isoformat()}
hours_available_per_day: {payload.hours_available_per_day}
planning_days: {planning_days}
estimated_total_capacity_hours: {estimated_total_capacity_hours}
""".strip()


def extract_json_text(raw_text: str) -> str:
    text = raw_text.strip()
    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()
    return text


def validate_plan_logic(plan: Plan) -> None:
    if plan.start_at.tzinfo is None or plan.start_at.utcoffset() is None:
        raise ValueError("start_at must include timezone")
    if plan.deadline_at.tzinfo is None or plan.deadline_at.utcoffset() is None:
        raise ValueError("deadline_at must include timezone")

    if plan.deadline_at <= plan.start_at:
        raise ValueError("deadline_at must be after start_at")

    day_dates = [d.date for d in plan.days]
    if min(day_dates) < plan.start_at.date():
        raise ValueError(
            "Plan starts before start_at date (timezone mismatch)"
        )
    if max(day_dates) > plan.deadline_at.date():
        raise ValueError("Plan extends beyond deadline_at date")

    for day in plan.days:
        if not day.items:
            raise ValueError(f"Day {day.date} has no items")

        daily_total = 0.0

        for item in day.items:
            if not item.title.strip():
                raise ValueError(f"Day {day.date} has an empty title")
            daily_total += item.duration_hours

        if daily_total > plan.hours_available_per_day:
            raise ValueError(
                f"Day {day.date} exceeds hours_available_per_day"
            )


def generate_plan_from_ai(payload: PlanningRequest) -> Plan:
    tz = tz_from_utc_offset_minutes(payload.utc_offset_minutes)
    start_at = now_utc().astimezone(tz).replace(microsecond=0)
    deadline_at = payload.deadline_at.astimezone(tz).replace(microsecond=0)

    if deadline_at <= start_at:
        raise PlanningInputError("deadline_at must be in the future")

    planning_window = deadline_at - start_at
    planning_days = max(1, planning_window.days + 1)
    estimated_total_capacity_hours = (
        planning_days * payload.hours_available_per_day
    )

    prompt = build_plan_prompt(
        payload=payload,
        start_at=start_at,
        deadline_at=deadline_at,
        planning_days=planning_days,
        estimated_total_capacity_hours=estimated_total_capacity_hours,
    )

    models_to_try = [GEMINI_MODEL_NAME] + list(GEMINI_FALLBACK_MODEL_NAMES)
    last_exc: Exception | None = None

    for idx, model_name in enumerate(models_to_try):
        is_last = idx == (len(models_to_try) - 1)
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={"temperature": 0.3},
            )

            raw_text = extract_json_text(response.text or "")
            try:
                data = json.loads(raw_text)
            except Exception as exc:
                raise ModelOutputError("Model returned invalid JSON") from exc

            # Keep boundaries deterministic regardless of minor model drift.
            data["start_at"] = start_at.isoformat()
            data["deadline_at"] = deadline_at.isoformat()
            data["hours_available_per_day"] = payload.hours_available_per_day

            try:
                plan = Plan(**data)
                validate_plan_logic(plan)
            except Exception as exc:
                raise ModelOutputError("Model returned an invalid plan") from exc

            return plan
        except PlanningInputError:
            raise
        except Exception as exc:
            last_exc = exc
            if not is_last:
                continue

    # All models failed.
    if last_exc is not None and _is_transient_model_error(last_exc):
        raise ModelUnavailableError("Model is temporarily unavailable") from last_exc

    if isinstance(last_exc, ModelOutputError):
        raise last_exc

    raise RuntimeError("Plan generation failed") from last_exc