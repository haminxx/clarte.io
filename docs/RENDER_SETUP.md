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

---

## 6. Health check (recommended)

In Render → your service → **Settings** → **Health Check Path**, set:

- **Health Check Path:** `/` or `/health`

The token server exposes both so Render gets a 200 instead of 404 and is less likely to treat the service as unhealthy.

---

## 7. Troubleshooting: "Failed to fetch"

**Cause:** On Render free tier the service **spins down** when idle. When you click "Call", the first request goes to a sleeping instance. Cold start can take **30–60+ seconds**. The browser may give up or report "Failed to fetch" before the server responds.

**Fixes applied in the repo:**

1. **Token server** – Added `GET /` and `GET /health` returning 200 so Render health checks don’t see 404 (which can trigger restarts or “unhealthy” state).
2. **Frontend** – Token request now has a **90-second timeout** and shows “Starting… (server may take up to a minute on first use)”. On timeout or network error, the UI shows a message that the server may be waking up and suggests trying again.
3. **Render** – Set **Health Check Path** to `/` or `/health` in the service settings so the service is marked healthy.

**If it still fails:** Wait 30–60 seconds after opening the page, then click Call again. For always-on behavior, use a paid Render plan or the free keep-warm option below.

---

## 8. Keep the server running 24/7 (free)

Render’s free tier **spins down** the service after **~15 minutes** of no traffic. You can keep it awake for free by having something hit your server every 10–15 minutes so it never goes idle.

**Option A: UptimeRobot (free, no code)**

1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account.
2. Add a **HTTP(s) Monitor**:
   - **URL:** `https://YOUR-SERVICE-NAME.onrender.com/health` (e.g. `https://clarte-io.onrender.com/health`)
   - **Monitoring interval:** 5 minutes (free tier allows this).
3. UptimeRobot will request that URL every 5 minutes. Render will see traffic and won’t spin down your service, so it effectively stays up 24/7.

**Option B: cron-job.org (free)**

1. Go to [cron-job.org](https://cron-job.org) and create a free account.
2. Create a new cron job:
   - **URL:** `https://YOUR-SERVICE-NAME.onrender.com/health`
   - **Schedule:** Every 10 or 15 minutes.
3. Save. The job will ping your server on that schedule and keep it from sleeping.

**Note:** This only keeps the service *awake*. Render free tier still has other limits (e.g. memory, build minutes). For guaranteed 24/7 with no spin-down at all, use a paid Render plan.
