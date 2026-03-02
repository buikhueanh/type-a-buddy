from pydantic import BaseModel, Field
from typing import Optional

# ---------- Plans ----------

class PlanCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

class PlanOut(BaseModel):
    id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# ---------- Tasks ----------

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=2000)

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=2000)

class TaskOut(BaseModel):
    id: str
    plan_id: str
    title: str
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None