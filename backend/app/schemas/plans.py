from pydantic import BaseModel, Field
from typing import Optional

class PlanCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)

class PlanOut(BaseModel):
    id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None