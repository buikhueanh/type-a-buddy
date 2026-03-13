from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from ..core.constants import (
    GOAL_MAX_LENGTH,
    GOAL_SUMMARY_MAX_LENGTH,
    HOURS_AVAILABLE_PER_DAY_MAX,
    PLAN_ITEM_NOTES_MAX_LENGTH,
    PLAN_ITEM_TITLE_MAX_LENGTH,
)


class PlanningRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=GOAL_MAX_LENGTH)
    deadline_at: datetime
    hours_available_per_day: float = Field(gt=0, le=HOURS_AVAILABLE_PER_DAY_MAX)

    @field_validator("deadline_at")
    @classmethod
    def deadline_must_include_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError(
                "deadline_at must include timezone, for example 2026-03-20T23:59:00+00:00"
            )
        return value

class PlanItem(BaseModel):
    title: str = Field(min_length=1, max_length=PLAN_ITEM_TITLE_MAX_LENGTH)
    duration_hours: float = Field(gt=0, le=HOURS_AVAILABLE_PER_DAY_MAX)
    notes: Optional[str] = Field(default=None, max_length=PLAN_ITEM_NOTES_MAX_LENGTH)


class PlanDay(BaseModel):
    date: date
    items: list[PlanItem] = Field(min_length=1)


class Plan(BaseModel):
    goal_summary: str = Field(min_length=1, max_length=GOAL_SUMMARY_MAX_LENGTH)
    start_at: datetime
    deadline_at: datetime
    hours_available_per_day: float = Field(gt=0, le=HOURS_AVAILABLE_PER_DAY_MAX)
    days: list[PlanDay] = Field(min_length=1)