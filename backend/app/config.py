import os
from dotenv import load_dotenv

# Load backend/.env (works when running uvicorn from backend/)
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "type_a_buddy")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")