from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from ..database import get_db
from ..core.security import hash_password, verify_password, create_access_token, decode_token
from ..schemas.auth import UserCreate, UserOut, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()

def _user_to_out(doc) -> UserOut:
    return UserOut(id=str(doc["_id"]), email=doc["email"])

@router.post("/register", response_model=UserOut)
def register(payload: UserCreate):
    db = get_db()

    email = payload.email.strip().lower()

    existing = db.users.find_one({"email": email}, {"_id": 1})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
    }
    res = db.users.insert_one(doc)
    created = db.users.find_one({"_id": res.inserted_id})
    return _user_to_out(created)

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    db = get_db()

    email = payload.email.strip().lower()
    user = db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=str(user["_id"]))
    return TokenResponse(access_token=token)

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> UserOut:
    token = creds.credentials
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid token")

    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return _user_to_out(user)

@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user