# Clarte Voice Agent

Executive Assistant voice agent with two paths:

- **Tier 1 (voice-only):** Browser connects to `/realtime` WebSocket relay. No LiveKit. Tools (Exa, stubs) run on relay.
- **Tier 2/3 (screen share, camera):** Browser connects to LiveKit; Python agent joins. Uses same tools.

## Environment check (frontend vs backend)

| Variable | Where | Used by |
|----------|--------|---------|
| **NEXT_PUBLIC_LIVEKIT_URL** | Frontend (e.g. `.env.local`, GitHub Actions secrets) | Browser – which LiveKit server to connect to (e.g. `wss://xxx.livekit.cloud`) |
| **NEXT_PUBLIC_VOICE_AGENT_URL** | Frontend (e.g. `.env.local`, GitHub Actions secrets) | Browser – where to get the token (e.g. `https://your-app.onrender.com`, no trailing slash) |
| **LIVEKIT_URL** | Backend only (`voice-agent/.env` or Render env) | Agent + token server – same WebSocket URL as above |
| **LIVEKIT_API_KEY**, **LIVEKIT_API_SECRET** | Backend only (never in frontend) | Token server + agent – to issue tokens and register with LiveKit |
| **OPENAI_API_KEY**, **EXA_API_KEY** | Backend only (never in frontend) | Agent + relay – Realtime API and Exa search |
| **ELEVEN_API_KEY** | Backend only (optional) | Agent – ElevenLabs TTS for more realistic voice. If set, uses ElevenLabs instead of OpenAI built-in voice. |

**Tier 1 only:** `OPENAI_API_KEY`, `EXA_API_KEY`, `NEXT_PUBLIC_VOICE_AGENT_URL`. No LiveKit needed.

**Tier 2/3:** Add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`.

Frontend vars are baked in at **build time** (Next.js). Backend vars are read at **runtime** by the Python process.

## OpenAI Realtime API – Cost & Pipeline

**Requirement:** OpenAI Realtime API is a paid feature. Add credits at [platform.openai.com](https://platform.openai.com) → Billing.

**Cost (approx.):**
- Audio input: ~$0.06/min
- Audio output: ~$0.24/min
- Text tokens: ~$5/M input, ~$20/M output
- Typical voice conversation: ~$0.30–0.50/min

**Pipeline:** Realtime API is **speech-to-speech** (no separate STT → LLM → TTS). One model handles audio in and out, so latency is ~300–800 ms for first response, often under 1 second.

## Local

1. Copy `.env.example` to `.env` and set:
   - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
   - `OPENAI_API_KEY`, `EXA_API_KEY`
2. Install: `pip install -r requirements.txt` (or `uv sync` if using uv)
3. **Option A – Agent only:** `python agent.py dev`
4. **Option B – Token server + agent (like Render):** `python start_render.py` (token server on port 8080, agent in subprocess)

Frontend: set `NEXT_PUBLIC_VOICE_AGENT_URL=http://localhost:8080` and `NEXT_PUBLIC_LIVEKIT_URL=<your LiveKit URL>`.

## Render

1. Create a **Web Service**, connect this repo.
2. **Root Directory:** `voice-agent`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python -u start_render.py` (the `-u` flag ensures unbuffered logs)
5. **Environment** (in Render dashboard):
   - `PYTHONUNBUFFERED=1` (ensures agent logs appear in Render logs)
   - `LIVEKIT_URL` (e.g. `wss://clarte-nrk5tnrq.livekit.cloud`)
   - `LIVEKIT_API_KEY` (secret)
   - `LIVEKIT_API_SECRET` (secret)
   - `OPENAI_API_KEY` (secret) — **Render only** (not needed in GitHub; agent runs on Render)
   - `EXA_API_KEY` (secret)
   - `ELEVEN_API_KEY` (secret, optional) — ElevenLabs TTS for more realistic voice. Marin → Rachel, Cedar → Adam.

After deploy, copy the Render URL (e.g. `https://your-service.onrender.com`) and set:
- **Frontend** `.env.local`: `NEXT_PUBLIC_VOICE_AGENT_URL=https://your-service.onrender.com` (no trailing slash)
- **GitHub** → Settings → Secrets → Actions: add `NEXT_PUBLIC_VOICE_AGENT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` so the built site can connect.

**Note:** `runtime.txt` pins Python 3.12 (LiveKit requires Python < 3.14). Noise cancellation is disabled to reduce memory usage on Render.

## Troubleshooting

### No audio from agent

1. **Render logs** – Render Dashboard → your service → Logs. Start a call and watch for:
   - `entrypoint started` → agent received the job
   - `Starting session with OpenAI Realtime API` → Realtime API in use
   - `participant_connected` → agent sees the user
   - `track_subscribed` → agent is receiving your audio
   - Any `ERROR`, `Exception`, or `OpenAI` messages

2. **Browser DevTools** – F12 → Network: confirm WebSocket to LiveKit URL. Console: check for LiveKit or audio errors. Application → Permissions: ensure microphone is allowed.

3. **Render cold start** – Free tier sleeps after ~15 min. The frontend warms up via `/health` before the token request. If the first call fails, wait ~30 seconds and try again.

4. **OpenAI credits** – Realtime API requires a paid account. Add credits at [platform.openai.com](https://platform.openai.com) → Billing.

5. **Mic not working** – Grant microphone permission when prompted. If "mic off" appears, refresh and allow access before starting the call.

6. **Out of memory** – Noise cancellation is disabled to reduce memory. If OOM persists, upgrade Render to a plan with more RAM (e.g. 2GB+).
