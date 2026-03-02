from fastapi import FastAPI
from .database import get_client

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/mongo")
def mongo_health():
    client = get_client()
    client.admin.command("ping")
    return {"mongo": "ok"}