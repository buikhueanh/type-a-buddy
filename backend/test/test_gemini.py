from pathlib import Path
import sys

from google import genai


# Allow running this file directly: `python backend/test/test_gemini.py`
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import require_gemini_api_key

client = genai.Client(api_key=require_gemini_api_key())

try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello in one sentence.",
    )
    print(response.text)
except Exception as exc:
    # Common failure: quota/rate-limit (HTTP 429) or invalid key.
    print("Gemini request failed:", str(exc))
    raise SystemExit(1)