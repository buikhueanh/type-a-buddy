from fastapi import APIRouter, HTTPException
from bson import ObjectId
from .database import get_db
from .models import TaskCreate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])

def _task_to_out(doc) -> TaskOut:
    return TaskOut(
        id=str(doc["_id"]),
        title=doc["title"],
        notes=doc.get("notes"),
    )

@router.post("", response_model=TaskOut)
def create_task(payload: TaskCreate):
    db = get_db()
    doc = {"title": payload.title, "notes": payload.notes}
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
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task id")
    db = get_db()
    doc = db.tasks.find_one({"_id": ObjectId(task_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_out(doc)

@router.delete("/{task_id}")
def delete_task(task_id: str):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task id")
    db = get_db()
    res = db.tasks.delete_one({"_id": ObjectId(task_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"deleted": True}