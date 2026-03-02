from fastapi import APIRouter, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from .database import get_db
from .models import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _task_to_out(doc) -> TaskOut:
    return TaskOut(
        id=str(doc["_id"]),
        title=doc["title"],
        notes=doc.get("notes"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )

def _obj_id(task_id: str) -> ObjectId:
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task id")
    return ObjectId(task_id)

@router.post("", response_model=TaskOut)
def create_task(payload: TaskCreate):
    db = get_db()
    now = _now_iso()
    doc = {
        "title": payload.title,
        "notes": payload.notes,
        "created_at": now,
        "updated_at": now,
    }
    res = db.tasks.insert_one(doc)
    created = db.tasks.find_one({"_id": res.inserted_id})
    return _task_to_out(created)

@router.get("", response_model=list[TaskOut])
def list_tasks():
    db = get_db()
    docs = db.tasks.find().sort("_id", -1).limit(100)
    return [_task_to_out(d) for d in docs]

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: str):
    db = get_db()
    doc = db.tasks.find_one({"_id": _obj_id(task_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_out(doc)

@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, payload: TaskUpdate):
    db = get_db()
    oid = _obj_id(task_id)

    updates = {}
    if payload.title is not None:
        updates["title"] = payload.title
    if payload.notes is not None:
        updates["notes"] = payload.notes

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = _now_iso()

    res = db.tasks.update_one({"_id": oid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    doc = db.tasks.find_one({"_id": oid})
    return _task_to_out(doc)

@router.delete("/{task_id}")
def delete_task(task_id: str):
    db = get_db()
    res = db.tasks.delete_one({"_id": _obj_id(task_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": True}