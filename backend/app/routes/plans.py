from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timezone
from bson import ObjectId

from ..schemas.plans import (
    PlanningRequest,
    Plan,
    SavePlanRequest,
    SavePlanResponse,
    SavedPlanSummary,
    SavedPlanDetail,
    DeletePlanResponse,
)
from ..services.ai_planner import generate_plan_from_ai

from .auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/plans", tags=["plans"])


def _obj_id(value: str, label: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail=f"Invalid {label}")
    return ObjectId(value)


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


@router.get("/saved", response_model=list[SavedPlanSummary])
async def list_saved_plans(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """List saved plans for the authenticated user.

    Returns lightweight summaries (no full generatedPlan payload).
    """
    try:
        user_id = str(current_user.id)

        cursor = (
            db.plans.find(
                {"userId": user_id},
                projection={
                    "goal": 1,
                    "deadline": 1,
                    "createdAt": 1,
                    "generatedPlan.goal_summary": 1,
                },
            )
            .sort("createdAt", -1)
        )

        docs = await cursor.to_list(length=200)

        out: list[SavedPlanSummary] = []
        for doc in docs:
            generated = doc.get("generatedPlan") or {}
            out.append(
                SavedPlanSummary(
                    planId=str(doc.get("_id")),
                    goal=doc.get("goal"),
                    goalSummary=generated.get("goal_summary"),
                    deadlineAt=doc.get("deadline"),
                    createdAt=doc.get("createdAt"),
                )
            )

        return out
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve saved plans: {str(exc)}",
        )


@router.get("/{plan_id}", response_model=SavedPlanDetail)
async def get_saved_plan(
    plan_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        user_id = str(current_user.id)
        plan_oid = _obj_id(plan_id, "plan id")

        doc = await db.plans.find_one({"_id": plan_oid, "userId": user_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Plan not found")

        generated_raw = doc.get("generatedPlan")
        if not generated_raw:
            raise HTTPException(status_code=500, detail="Saved plan is missing generated content")

        generated_plan = Plan.model_validate(generated_raw)

        return SavedPlanDetail(
            planId=str(doc.get("_id")),
            goal=doc.get("goal"),
            deadlineAt=doc.get("deadline"),
            createdAt=doc.get("createdAt"),
            generatedPlan=generated_plan,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve plan: {str(exc)}",
        )


@router.delete("/{plan_id}", response_model=DeletePlanResponse)
async def delete_saved_plan(
    plan_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        user_id = str(current_user.id)
        plan_oid = _obj_id(plan_id, "plan id")

        res = await db.plans.delete_one({"_id": plan_oid, "userId": user_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Plan not found")

        return DeletePlanResponse(ok=True)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete plan: {str(exc)}",
        )
