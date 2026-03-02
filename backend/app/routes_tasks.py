from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from .database import get_db
from .models import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/plans/{plan_id}/tasks", tags=["tasks"])

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _obj_id(value: str, label: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail=f"Invalid {label}")
    return ObjectId(value)

def _task_to_out(doc) -> TaskOut:
    return TaskOut(
        id=str(doc["_id"]),
        plan_id=str(doc["plan_id"]),
        title=doc["title"],
        notes=doc.get("notes"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )

def _ensure_plan_exists(db, plan_oid: ObjectId):
    exists = db.plans.find_one({"_id": plan_oid}, {"_id": 1})
    if not exists:
        raise HTTPException(status_code=404, detail="Plan not found")

@router.post("", response_model=TaskOut)
def create_task(plan_id: str, payload: TaskCreate):
    db = get_db()
    plan_oid = _obj_id(plan_id, "plan id")
    _ensure_plan_exists(db, plan_oid)

    now = _now_iso()
    doc = {
        "plan_id": plan_oid,
        "title": payload.title,
        "notes": payload.notes,
        "created_at": now,
        "updated_at": now,
    }
    res = db.tasks.insert_one(doc)
    created = db.tasks.find_one({"_id": res.inserted_id})
    return _task_to_out(created)

@router.get("", response_model=list[TaskOut])
def list_tasks(plan_id: str):
    db = get_db()
    plan_oid = _obj_id(plan_id, "plan id")
    _ensure_plan_exists(db, plan_oid)

    docs = db.tasks.find({"plan_id": plan_oid}).sort("_id", -1).limit(200)
    return [_task_to_out(d) for d in docs]

@router.get("/{task_id}", response_model=TaskOut)
def get_task(plan_id: str, task_id: str):
    db = get_db()
    plan_oid = _obj_id(plan_id, "plan id")
    task_oid = _obj_id(task_id, "task id")
    _ensure_plan_exists(db, plan_oid)

    doc = db.tasks.find_one({"_id": task_oid, "plan_id": plan_oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_out(doc)

@router.put("/{task_id}", response_model=TaskOut)
def update_task(plan_id: str, task_id: str, payload: TaskUpdate):
    db = get_db()
    plan_oid = _obj_id(plan_id, "plan id")
    task_oid = _obj_id(task_id, "task id")
    _ensure_plan_exists(db, plan_oid)

    updates = {}
    if payload.title is not None:
        updates["title"] = payload.title
    if payload.notes is not None:
        updates["notes"] = payload.notes

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = _now_iso()

    res = db.tasks.update_one({"_id": task_oid, "plan_id": plan_oid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    doc = db.tasks.find_one({"_id": task_oid, "plan_id": plan_oid})
    return _task_to_out(doc)

@router.delete("/{task_id}")
def delete_task(plan_id: str, task_id: str):
    db = get_db()
    plan_oid = _obj_id(plan_id, "plan id")
    task_oid = _obj_id(task_id, "task id")
    _ensure_plan_exists(db, plan_oid)

    res = db.tasks.delete_one({"_id": task_oid, "plan_id": plan_oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": True}