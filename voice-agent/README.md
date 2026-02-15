# Clarte Voice Agent

LiveKit agent using OpenAI Realtime API + Exa. Runs with a token server so the frontend can get LiveKit tokens.

## Environment check (frontend vs backend)

| Variable | Where | Used by |
|----------|--------|---------|
| **NEXT_PUBLIC_LIVEKIT_URL** | Frontend (e.g. `.env.local`, GitHub Actions secrets) | Browser – which LiveKit server to connect to (e.g. `wss://xxx.livekit.cloud`) |
| **NEXT_PUBLIC_VOICE_AGENT_URL** | Frontend (e.g. `.env.local`, GitHub Actions secrets) | Browser – where to get the token (e.g. `https://your-app.onrender.com`, no trailing slash) |
| **LIVEKIT_URL** | Backend only (`voice-agent/.env` or Render env) | Agent + token server – same WebSocket URL as above |
| **LIVEKIT_API_KEY**, **LIVEKIT_API_SECRET** | Backend only (never in frontend) | Token server + agent – to issue tokens and register with LiveKit |
| **OPENAI_API_KEY**, **EXA_API_KEY** | Backend only (never in frontend) | Agent – Realtime API and Exa search |

Frontend vars are baked in at **build time** (Next.js). Backend vars are read at **runtime** by the Python process.

## Local

1. Copy `.env.example` to `.env` and set:
   - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
   - `OPENAI_API_KEY`, `EXA_API_KEY`
2. Install: `pip install -r requirements.txt` (or `uv sync` if using uv)
3. **Option A – Agent only:** `python agent.py dev`
4. **Option B – Token server + agent (like Render):** `python start_render.py` (serves token server on port 8080, agent in background)

Frontend: set `NEXT_PUBLIC_VOICE_AGENT_URL=http://localhost:8080` and `NEXT_PUBLIC_LIVEKIT_URL=<your LiveKit URL>`.

## Render

1. Create a **Web Service**, connect this repo.
2. **Root Directory:** `voice-agent`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python start_render.py`
5. **Environment** (in Render dashboard):
   - `LIVEKIT_URL` (e.g. `wss://clarte-nrk5tnrq.livekit.cloud`)
   - `LIVEKIT_API_KEY` (secret)
   - `LIVEKIT_API_SECRET` (secret)
   - `OPENAI_API_KEY` (secret)
   - `EXA_API_KEY` (secret)

After deploy, copy the Render URL (e.g. `https://your-service.onrender.com`) and set:
- **Frontend** `.env.local`: `NEXT_PUBLIC_VOICE_AGENT_URL=https://your-service.onrender.com` (no trailing slash)
- **GitHub** → Settings → Secrets → Actions: add `NEXT_PUBLIC_VOICE_AGENT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` so the built site can connect.
