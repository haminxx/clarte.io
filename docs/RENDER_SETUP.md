# Render setup for Clarte Voice Agent

Use these settings when you create a **Web Service** on Render that runs the voice-agent (token server + LiveKit agent).

---

## 1. Create a new Web Service

- **Repository:** Connect your GitHub repo (the one that contains the Clarte project with the `voice-agent/` folder).
- **Type:** **Web Service**.

---

## 2. Build & deploy settings

| Setting | Value |
|--------|--------|
| **Name** | e.g. `clarte-voice-agent` (you’ll use this as the base for your URL). |
| **Region** | Choose one close to your users. |
| **Branch** | Your main branch (e.g. `v0/clarte_main` or `main`). |
| **Root Directory** | `voice-agent` |
| **Runtime** | **Python 3** |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python start_render.py` |

Render will set `PORT` automatically; the start script uses it for the token server.

---

## 3. Environment variables (Render dashboard)

In the Render service → **Environment** tab, add these **Environment Variables** (use “Add Environment Variable” and choose **Secret** for any value that must stay private):

| Key | Value | Secret? |
|-----|--------|--------|
| `LIVEKIT_URL` | `wss://clarte-nrk5tnrq.livekit.cloud` | No (URL only) |
| `LIVEKIT_API_KEY` | Your LiveKit API key | **Yes** |
| `LIVEKIT_API_SECRET` | Your LiveKit API secret | **Yes** |
| `OPENAI_API_KEY` | Your OpenAI API key (for Realtime) | **Yes** |
| `EXA_API_KEY` | Your Exa API key | **Yes** |

Do **not** add `NEXT_PUBLIC_*` or `PORT` here; the frontend URLs go in GitHub / `.env.local`, and Render sets `PORT` for you.

---

## 4. After the first deploy

- Render will show a URL like: `https://clarte-voice-agent.onrender.com` (your service name may differ).
- Use that as your **token server URL**:
  - In **project root `.env.local`**: `NEXT_PUBLIC_VOICE_AGENT_URL=https://clarte-voice-agent.onrender.com` (no trailing slash).
  - In **GitHub** → repo **Settings** → **Secrets and variables** → **Actions**: add or update the secret `NEXT_PUBLIC_VOICE_AGENT_URL` with that same URL.

---

## 5. Free tier note

On the free tier, the service may spin down after inactivity. The first request after that can take 30–60 seconds (cold start). For production, consider a paid plan so the service stays warm.
