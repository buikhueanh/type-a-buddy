from datetime import timezone

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import MONGODB_URI, MONGODB_DB_NAME

_client: AsyncIOMotorClient | None = None

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=1000,
            tz_aware=True,
            tzinfo=timezone.utc,
        )
    return _client

def get_db() -> AsyncIOMotorDatabase:
    return get_client()[MONGODB_DB_NAME]