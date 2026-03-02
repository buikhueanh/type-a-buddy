from typing import Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=2000)


class TaskOut(BaseModel):
    id: str
    title: str
    notes: Optional[str] = None
