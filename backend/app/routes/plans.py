from fastapi import APIRouter, HTTPException

from ..schemas.plans import PlanningRequest, Plan
from ..services.ai_planner import generate_plan_from_ai

router = APIRouter(prefix="/plans", tags=["plans"])


@router.post("/generate", response_model=Plan)
def generate_plan(payload: PlanningRequest):
    try:
        return generate_plan_from_ai(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Plan generation failed: {str(exc)}",
        )