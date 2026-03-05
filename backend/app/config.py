import os
from pathlib import Path

from dotenv import load_dotenv


def _env_bool(name: str, default: bool = False) -> bool:
	raw = os.getenv(name)
	if raw is None:
		return default
	return raw.strip().lower() in {"1", "true", "yes", "y", "on"}


def _env_int(name: str, default: int) -> int:
	raw = os.getenv(name)
	if raw is None or raw.strip() == "":
		return default
	try:
		return int(raw)
	except ValueError:
		return default


def _env_csv(name: str, default: list[str]) -> list[str]:
	raw = os.getenv(name)
	if raw is None or raw.strip() == "":
		return default
	return [v.strip() for v in raw.split(",") if v.strip()]


# Load backend/.env deterministically (works from repo root or backend/)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")


# Database
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "type_a_buddy")


# Auth/JWT
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRE_MINUTES = _env_int("JWT_EXPIRE_MINUTES", 60 * 24)


# Password reset (6-digit code)
PASSWORD_RESET_CODE_EXPIRE_MINUTES = _env_int("PASSWORD_RESET_CODE_EXPIRE_MINUTES", 10)
PASSWORD_RESET_RETURN_CODE = _env_bool("PASSWORD_RESET_RETURN_CODE", False)


# Email (SMTP)
APP_NAME = os.getenv("APP_NAME", "Type-A Buddy")
PASSWORD_RESET_EMAIL_SUBJECT = os.getenv(
	"PASSWORD_RESET_EMAIL_SUBJECT", "Your password reset code"
)

SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = _env_int("SMTP_PORT", 587)
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", "").strip()
SMTP_TLS = _env_bool("SMTP_TLS", True)
SMTP_SSL = _env_bool("SMTP_SSL", False)


# Web
CORS_ALLOW_ORIGINS = _env_csv(
	"CORS_ALLOW_ORIGINS",
	[
		"http://localhost:19006",
		"http://127.0.0.1:19006",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	],
)