# Run Clarte Pipecat backend

## Prerequisites

- **Python 3.10, 3.11, or 3.13** (not 3.14 — pipecat’s `numba` doesn’t support it yet).
- API keys in `backend/.env` (see project `docs/PIPECAT_SETUP_AND_API_KEYS.md`).

## One-time setup (Python 3.13 recommended)

From the `backend` folder:

```powershell
# Create venv with Python 3.13 (if you have it: py -3.13)
py -3.13 -m venv .venv

# Activate (PowerShell)
.\.venv\Scripts\Activate.ps1

# Install dependencies (can take a few minutes)
pip install -r requirements.txt
```

## Run the server

With the venv activated:

```powershell
uvicorn server:app --host 0.0.0.0 --port 8000
```

Or:

```powershell
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```

Then open the Next.js app and use **Start voice call** on the home page; the frontend will POST to `http://localhost:8000/session` to create a Daily room and join.
