# Backend (FastAPI)

## Tech Stack
- FastAPI
- MongoDB Atlas (Motor)
- Gemini API (google-genai)

## Deployed Backend
The backend is already deployed and connected to MongoDB Atlas:
- API base URL: `https://type-a-buddy-api.onrender.com`

For grading/demo purposes, you do not need to run the backend locally.

## Requirements (Optional Local Development)
- Python 3.11+ (venv recommended)

## Setup (Local - Optional)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` (do not commit). Example values:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=type_a_buddy
JWT_SECRET=change-me
JWT_ALG=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ALLOW_ORIGINS=http://localhost:19006,http://127.0.0.1:19006
GEMINI_API_KEY=your_key_here

# Demo mode (Render Free): return reset code in API response
PASSWORD_RESET_RETURN_CODE=true

# Optional SMTP (not usable on Render Free)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_TLS=true
SMTP_SSL=false
SMTP_USER=you@gmail.com
SMTP_PASSWORD=app_password
SMTP_FROM=you@gmail.com
```

Run locally:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health checks:
- `GET /health`
- `GET /mongo`

## Deployment (Render - Reference)

### Demo Password Reset (Free Tier)
Render Free blocks SMTP ports, so email cannot be sent. Enable demo mode:

Behavior:

## Media / Demo
Screenshots and demo videos are documented in the root README.


## API URLs
- Render: `https://type-a-buddy-api.onrender.com`
- Local: `http://127.0.0.1:8000` (optional dev)
