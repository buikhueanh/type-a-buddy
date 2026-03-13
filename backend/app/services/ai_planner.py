import json
from datetime import datetime, timezone

from google import genai

from ..config import require_gemini_api_key
from ..core.constants import GEMINI_MODEL_NAME
from ..schemas.plans import PlanningRequest, Plan


client = genai.Client(api_key=require_gemini_api_key())


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def build_plan_prompt(
    payload: PlanningRequest,
    start_at: datetime,
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
  "start_at": "YYYY-MM-DDTHH:MM:SS+00:00",
  "deadline_at": "YYYY-MM-DDTHH:MM:SS+00:00",
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

User goal:
{payload.goal}

Planning inputs:
start_at: {start_at.isoformat()}
deadline_at: {payload.deadline_at.isoformat()}
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
    if plan.deadline_at <= plan.start_at:
        raise ValueError("deadline_at must be after start_at")

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
    start_at = now_utc()

    if payload.deadline_at <= start_at:
        raise ValueError("deadline_at must be in the future")

    planning_window = payload.deadline_at - start_at
    planning_days = max(1, planning_window.days + 1)
    estimated_total_capacity_hours = (
        planning_days * payload.hours_available_per_day
    )

    prompt = build_plan_prompt(
        payload=payload,
        start_at=start_at,
        planning_days=planning_days,
        estimated_total_capacity_hours=estimated_total_capacity_hours,
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=prompt,
        config={"temperature": 0.3},
    )

    raw_text = extract_json_text(response.text)
    data = json.loads(raw_text)

    plan = Plan(**data)
    validate_plan_logic(plan)
    return plan