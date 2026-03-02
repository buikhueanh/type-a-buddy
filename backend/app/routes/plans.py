from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from ..database import get_db
from ..schemas.plans import PlanCreate, PlanOut

router = APIRouter(prefix="/plans", tags=["plans"])

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _plan_to_out(doc) -> PlanOut:
    return PlanOut(
        id=str(doc["_id"]),
        title=doc["title"],
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )

@router.post("", response_model=PlanOut)
def create_plan(payload: PlanCreate):
    db = get_db()
    now = _now_iso()
    doc = {
        "title": payload.title,
        "created_at": now,
        "updated_at": now,
    }
    res = db.plans.insert_one(doc)
    created = db.plans.find_one({"_id": res.inserted_id})
    return _plan_to_out(created)

@router.get("", response_model=list[PlanOut])
def list_plans():
    db = get_db()
    docs = db.plans.find().sort("_id", -1).limit(50)
    return [_plan_to_out(d) for d in docs]

@router.get("/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: str):
    if not ObjectId.is_valid(plan_id):
        raise HTTPException(status_code=400, detail="Invalid plan id")
    db = get_db()
    doc = db.plans.find_one({"_id": ObjectId(plan_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Plan not found")
    return _plan_to_out(doc)