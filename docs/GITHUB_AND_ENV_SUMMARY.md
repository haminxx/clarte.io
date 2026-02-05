# Where to put every URL and API key (summary)

Use this as a checklist. **Never commit real API keys or secrets** to the repo or paste them in chat.

---

## 1. Render (voice-agent Web Service)

**Where:** Render dashboard → your Web Service → **Environment** tab.

| Variable | What to put | Notes |
|----------|-------------|--------|
| `LIVEKIT_URL` | `wss://clarte-nrk5tnrq.livekit.cloud` | LiveKit WebSocket URL. |
| `LIVEKIT_API_KEY` | Your LiveKit API key | From LiveKit Cloud. Mark as **Secret**. |
| `LIVEKIT_API_SECRET` | Your LiveKit API secret | From LiveKit Cloud. Mark as **Secret**. |
| `OPENAI_API_KEY` | Your OpenAI API key | For Realtime. Mark as **Secret**. |
| `EXA_API_KEY` | Your Exa API key | For research path. Mark as **Secret**. |

**Render build/start:** See **docs/RENDER_SETUP.md** (Root: `voice-agent`, Build: `pip install -r requirements.txt`, Start: `python start_render.py`).

After deploy, copy the **Render service URL** (e.g. `https://clarte-voice-agent.onrender.com`) and use it for the two places below.

---

## 2. GitHub (repository secrets for frontend build)

**Where:** GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

| Secret name | Value | Why |
|-------------|--------|-----|
| `NEXT_PUBLIC_LIVEKIT_URL` | `wss://clarte-nrk5tnrq.livekit.cloud` | So the built site knows where to connect to LiveKit. |
| `NEXT_PUBLIC_VOICE_AGENT_URL` | Your Render URL, e.g. `https://clarte-voice-agent.onrender.com` | So the built site knows where to get a token (no trailing slash). |

**Do not add:** `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`, or `EXA_API_KEY` to GitHub. Those stay only on Render and in local `voice-agent/.env`.

---

## 3. Project root `.env.local` (frontend, local dev)

**Where:** In the project root (same folder as `package.json`). This file is gitignored.

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_LIVEKIT_URL` | `wss://clarte-nrk5tnrq.livekit.cloud` |
| `NEXT_PUBLIC_VOICE_AGENT_URL` | Your Render URL (e.g. `https://clarte-voice-agent.onrender.com`) or `http://localhost:8080` if testing the token server locally. |

Use this when you run `npm run dev` or `npm run build` locally so the frontend can connect to LiveKit and your token server.

---

## 4. `voice-agent/.env` (Python, local dev only)

**Where:** Inside the `voice-agent/` folder. Copy from `voice-agent/.env.example`. This file is gitignored.

| Variable | Value |
|----------|--------|
| `LIVEKIT_URL` | `wss://clarte-nrk5tnrq.livekit.cloud` |
| `LIVEKIT_API_KEY` | Your LiveKit API key |
| `LIVEKIT_API_SECRET` | Your LiveKit API secret |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `EXA_API_KEY` | Your Exa API key |

Use this when you run the agent and token server **on your machine** (e.g. `python start_render.py` or `uvicorn token_server:app` + `python agent.py dev`). For production, Render uses its own environment (section 1); you don’t need to put these in the repo.

---

## 5. Firebase

**No URLs or API keys go in Firebase** for this voice setup. The site is built by GitHub Actions (using the GitHub secrets above) and deployed to Firebase Hosting. Firebase only serves the built files.

---

## Quick reference

| What | Render | GitHub Secrets | Root `.env.local` | `voice-agent/.env` |
|------|--------|----------------|-------------------|---------------------|
| LiveKit URL | ✅ `LIVEKIT_URL` | ✅ `NEXT_PUBLIC_LIVEKIT_URL` | ✅ `NEXT_PUBLIC_LIVEKIT_URL` | ✅ `LIVEKIT_URL` |
| LiveKit API key | ✅ (Secret) | ❌ | ❌ | ✅ |
| LiveKit API secret | ✅ (Secret) | ❌ | ❌ | ✅ |
| OpenAI API key | ✅ (Secret) | ❌ | ❌ | ✅ |
| Exa API key | ✅ (Secret) | ❌ | ❌ | ✅ |
| Token server URL | — | ✅ `NEXT_PUBLIC_VOICE_AGENT_URL` | ✅ `NEXT_PUBLIC_VOICE_AGENT_URL` | ❌ |

**Meaning of “Token server URL”:** The public URL of your Render Web Service (the voice-agent). The frontend calls `{that URL}/token` to get a LiveKit token. Example: `https://clarte-voice-agent.onrender.com`.
