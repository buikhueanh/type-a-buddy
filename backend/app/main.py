from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import get_client
from .routes_plans import router as plans_router
from .routes_tasks import router as tasks_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/mongo")
def mongo_health():
    client = get_client()
    client.admin.command("ping")
    return {"mongo": "ok"}

app.include_router(plans_router)
app.include_router(tasks_router)