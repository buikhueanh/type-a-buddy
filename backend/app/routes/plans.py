from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timezone

from ..schemas.plans import PlanningRequest, Plan, SavePlanRequest, SavePlanResponse
from ..services.ai_planner import generate_plan_from_ai

from .auth import get_current_user
from ..database import get_db

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
    
@router.post("/save", response_model=SavePlanResponse, status_code=status.HTTP_201_CREATED)
async def save_plan(
    payload: SavePlanRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        user_id = str(current_user.id)

        plan_document = {
            "userId": user_id,
            "goal": payload.goal,
            "deadline": payload.generatedPlan.deadline_at,
            "generatedPlan": payload.generatedPlan.model_dump(mode="json"),
            "createdAt": datetime.now(timezone.utc),
        }

        result = await db.plans.insert_one(plan_document)

        return SavePlanResponse(
            message="Plan saved successfully",
            planId=str(result.inserted_id),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save plan: {str(e)}",
        )
