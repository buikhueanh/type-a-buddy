from fastapi import FastAPI
from .database import get_client
from .routes_tasks import router as tasks_router

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/mongo")
def mongo_health():
    client = get_client()
    client.admin.command("ping")
    return {"mongo": "ok"}

app.include_router(tasks_router)