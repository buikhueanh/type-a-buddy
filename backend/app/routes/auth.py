from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from ..database import get_db
from .. import config
from ..core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
    generate_password_reset_code,
    hash_password_reset_code,
    verify_password_reset_code,
    password_reset_code_expires_at,
)
from ..core.email import try_send_password_reset_code_email
from ..schemas.auth import (
    UserCreate,
    UserOut,
    LoginRequest,
    TokenResponse,
    PasswordResetRequest,
    PasswordResetStartResponse,
    PasswordResetConfirm,
    OkResponse,
)

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


@router.post("/forgot-password", response_model=PasswordResetStartResponse)
def forgot_password(payload: PasswordResetRequest):
    """Start password reset flow.

    For privacy, this always returns ok=True even if the email doesn't exist.
    In local/dev you can set PASSWORD_RESET_RETURN_CODE=true to return the code
    directly (in addition to sending email, if SMTP is configured).
    """
    db = get_db()
    email = payload.email.strip().lower()
    user = db.users.find_one({"email": email}, {"_id": 1})

    if not user:
        return PasswordResetStartResponse(ok=True)

    # Ensure TTL cleanup for expired codes
    try:
        db.password_reset_codes.create_index("expires_at", expireAfterSeconds=0)
        db.password_reset_codes.create_index([("user_id", 1)])
    except Exception:
        pass

    code = generate_password_reset_code()
    code_hash = hash_password_reset_code(code)
    now = datetime.utcnow()

    # Keep only one active code per user
    db.password_reset_codes.delete_many({"user_id": user["_id"]})
    db.password_reset_codes.insert_one(
        {
            "user_id": user["_id"],
            "email": email,
            "code_hash": code_hash,
            "created_at": now,
            "expires_at": password_reset_code_expires_at(),
        }
    )

    # Send email if configured; don't fail endpoint on SMTP errors.
    try_send_password_reset_code_email(to_email=email, code=code)

    if config.PASSWORD_RESET_RETURN_CODE:
        return PasswordResetStartResponse(ok=True, code=code)
    return PasswordResetStartResponse(ok=True)


@router.post("/reset-password", response_model=OkResponse)
def reset_password(payload: PasswordResetConfirm):
    db = get_db()

    email = payload.email.strip().lower()
    user = db.users.find_one({"email": email}, {"_id": 1})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    record = db.password_reset_codes.find_one({"user_id": user["_id"]})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    expires_at = record.get("expires_at")
    if not expires_at or expires_at <= datetime.utcnow():
        db.password_reset_codes.delete_many({"user_id": user["_id"]})
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    if not verify_password_reset_code(payload.code, record.get("code_hash", "")):
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": hash_password(payload.new_password)}},
    )

    db.password_reset_codes.delete_many({"user_id": user["_id"]})

    return OkResponse(ok=True)

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