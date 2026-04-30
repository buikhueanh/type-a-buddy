from pathlib import Path
import sys

from google import genai


# Allow running this file directly: `python backend/test/test_gemini.py`
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import require_gemini_api_key
from app.core.constants import GEMINI_MODEL_NAME, GEMINI_FALLBACK_MODEL_NAMES

client = genai.Client(api_key=require_gemini_api_key())

print("Primary model:", GEMINI_MODEL_NAME)
print("Fallback models:", ", ".join(GEMINI_FALLBACK_MODEL_NAMES) if GEMINI_FALLBACK_MODEL_NAMES else "(none)")

try:
    response = client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents="Say hello in one sentence.",
    )
    print(response.text)
except Exception as exc:
    # Common failure: quota/rate-limit (HTTP 429) or invalid key.
    print("Gemini request failed:", str(exc))
    raise SystemExit(1)