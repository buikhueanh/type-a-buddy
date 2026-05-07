import secrets
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError

from .. import config

# NOTE: passlib's bcrypt handler (passlib==1.7.4) is incompatible with newer
# bcrypt backends that error on passwords >72 bytes (e.g. bcrypt==5.x), and can
# crash during backend self-checks. Use pbkdf2_sha256 for a pure-Python, portable
# hashing scheme.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

JWT_SECRET = config.JWT_SECRET
JWT_ALG = config.JWT_ALG
JWT_EXPIRE_MINUTES = config.JWT_EXPIRE_MINUTES

PASSWORD_RESET_CODE_EXPIRE_MINUTES = config.PASSWORD_RESET_CODE_EXPIRE_MINUTES

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

def create_access_token(subject: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError as e:
        raise ValueError("Invalid token") from e


def generate_password_reset_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_password_reset_code(code: str) -> str:
    return pwd_context.hash(code)


def verify_password_reset_code(code: str, code_hash: str) -> bool:
    return pwd_context.verify(code, code_hash)


def password_reset_code_expires_at():
    return datetime.now(timezone.utc) + timedelta(minutes=PASSWORD_RESET_CODE_EXPIRE_MINUTES)