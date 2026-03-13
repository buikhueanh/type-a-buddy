from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .database import get_client
from .routes.auth import router as auth_router
from .routes.plans import router as plans_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOW_ORIGINS,
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


app.include_router(auth_router)
app.include_router(plans_router)