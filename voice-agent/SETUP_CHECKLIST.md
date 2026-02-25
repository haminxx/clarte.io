# Clarte Setup Checklist

## Tier 1 (Voice-Only) – Minimum to Test

| Item | Where to Get | Where to Set |
|------|--------------|--------------|
| **OpenAI API Key** | [platform.openai.com](https://platform.openai.com) → API keys. Requires Realtime API access and billing. | `OPENAI_API_KEY` in voice-agent/.env (local) or Render env |
| **Exa API Key** | [exa.ai](https://exa.ai) | `EXA_API_KEY` in voice-agent/.env or Render |

## Tier 2/3 (Screen Share, Camera) – LiveKit Path

| Item | Where to Get | Where to Set |
|------|--------------|--------------|
| **LiveKit Cloud** | [cloud.livekit.io](https://cloud.livekit.io) – create project | |
| **LiveKit URL** | Project → Settings → WebSocket URL (e.g. `wss://xxx.livekit.cloud`) | `LIVEKIT_URL` (backend), `NEXT_PUBLIC_LIVEKIT_URL` (frontend .env.local) |
| **LiveKit API Key** | Project → Settings → Keys | `LIVEKIT_API_KEY` (backend) |
| **LiveKit API Secret** | Same | `LIVEKIT_API_SECRET` (backend) |

## Frontend (Next.js)

| Item | Where to Set |
|------|--------------|
| **NEXT_PUBLIC_VOICE_AGENT_URL** | Your Render URL (e.g. `https://your-app.onrender.com`) – no trailing slash. Used for token (Tier 2/3) and relay WebSocket (Tier 1). |
| **NEXT_PUBLIC_LIVEKIT_URL** | Only needed for Tier 2/3. Set when using screen share/camera. |

## Firebase (Optional for Auth)

| Item | Where to Get | Where to Set |
|------|--------------|--------------|
| **Firebase config** | Firebase Console → Project Settings | `NEXT_PUBLIC_FIREBASE_*` in .env.local |

## Local Development

1. **voice-agent/.env:**
   ```
   OPENAI_API_KEY=sk-...
   EXA_API_KEY=...
   LIVEKIT_URL=wss://...   # only for Tier 2/3
   LIVEKIT_API_KEY=...     # only for Tier 2/3
   LIVEKIT_API_SECRET=...  # only for Tier 2/3
   ```

2. **Next.js .env.local:**
   ```
   NEXT_PUBLIC_VOICE_AGENT_URL=http://localhost:8080
   NEXT_PUBLIC_LIVEKIT_URL=wss://...   # only for Tier 2/3
   ```

3. Run: `cd voice-agent && python start_render.py` (starts token server + agent + relay on 8080)
4. Run: `npm run dev` (Next.js)

## Render Deployment

- Root directory: `voice-agent`
- Build: `pip install -r requirements.txt`
- Start: `python -u start_render.py`
- Env vars: `OPENAI_API_KEY`, `EXA_API_KEY`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `PYTHONUNBUFFERED=1`
