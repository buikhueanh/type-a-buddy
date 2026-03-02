from pymongo import MongoClient
from .config import MONGODB_URI, MONGODB_DB_NAME

_client: MongoClient | None = None

def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1000)
    return _client

def get_db():
    return get_client()[MONGODB_DB_NAME]