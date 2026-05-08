"""Manual SMTP smoke test.

Run from backend/ with your env configured (local .env or exported env vars):

  .venv/bin/python test/test_smtp.py --to you@example.com

This validates that the backend can connect/login and send an email using
app.core.email.send_password_reset_code_email.

Notes:
- Does NOT print secrets.
- Exits non-zero on failure.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow running directly: `python backend/test/test_smtp.py`
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import config
from app.core.email import send_password_reset_code_email, smtp_is_configured


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--to", dest="to_email", required=True)
    args = parser.parse_args()

    print("smtp_is_configured:", smtp_is_configured())
    print(
        "smtp settings:",
        {
            "SMTP_HOST": bool(config.SMTP_HOST),
            "SMTP_PORT": config.SMTP_PORT,
            "SMTP_TLS": config.SMTP_TLS,
            "SMTP_SSL": config.SMTP_SSL,
            "SMTP_USER_set": bool(config.SMTP_USER),
            "SMTP_FROM_set": bool(config.SMTP_FROM),
        },
    )

    if not smtp_is_configured():
        print("ERROR: SMTP not configured (need SMTP_HOST and SMTP_FROM)")
        return 2

    try:
        send_password_reset_code_email(to_email=args.to_email, code="123456")
        print("OK: email send attempted (check inbox/spam)")
        return 0
    except Exception as exc:
        print("FAILED:", type(exc).__name__, str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
