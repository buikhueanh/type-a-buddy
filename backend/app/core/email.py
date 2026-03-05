import logging
import smtplib
from email.message import EmailMessage

from .. import config

logger = logging.getLogger(__name__)


def smtp_is_configured() -> bool:
    return bool(config.SMTP_HOST and config.SMTP_FROM)


def send_password_reset_code_email(*, to_email: str, code: str) -> None:
    """Send a password reset code email via SMTP.

    Configure via env:
    - SMTP_HOST (required)
    - SMTP_PORT (default 587)
    - SMTP_USER / SMTP_PASSWORD (optional)
    - SMTP_FROM (required)
    - SMTP_TLS (default true) or SMTP_SSL (default false)
    """

    if not config.SMTP_HOST:
        raise RuntimeError("SMTP_HOST is not set")

    if not config.SMTP_FROM:
        raise RuntimeError("SMTP_FROM is not set")

    port = config.SMTP_PORT
    username = config.SMTP_USER
    password = config.SMTP_PASSWORD

    use_tls = config.SMTP_TLS
    use_ssl = config.SMTP_SSL

    subject = config.PASSWORD_RESET_EMAIL_SUBJECT
    app_name = config.APP_NAME

    msg = EmailMessage()
    msg["From"] = config.SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(
        f"Your {app_name} password reset code is: {code}\n\n"
        "If you did not request a password reset, you can ignore this email.\n"
    )

    if use_ssl:
        server: smtplib.SMTP = smtplib.SMTP_SSL(host=config.SMTP_HOST, port=port, timeout=10)
    else:
        server = smtplib.SMTP(host=config.SMTP_HOST, port=port, timeout=10)

    try:
        server.ehlo()
        if use_tls and not use_ssl:
            server.starttls()
            server.ehlo()

        if username and password:
            server.login(username, password)

        server.send_message(msg)
    finally:
        try:
            server.quit()
        except Exception:
            pass


def try_send_password_reset_code_email(*, to_email: str, code: str) -> None:
    if not smtp_is_configured():
        logger.info("SMTP not configured; skipping reset code email")
        return
    try:
        send_password_reset_code_email(to_email=to_email, code=code)
        logger.info("Reset code email sent", extra={"to_email": to_email})
    except Exception:
        logger.warning("Failed to send reset code email", exc_info=True)
