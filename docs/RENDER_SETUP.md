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

## 6. Health check (required for stability)

Render sends **HEAD** requests to the root by default. The token server now responds to **HEAD** on `/` and `/health` with **200** (no body). Without this, Render gets **405 Method Not Allowed** and may restart the service repeatedly.

In Render → your service → **Settings**:

- **Health Check Path:** `/health` (or `/`)
- **Health Check Interval:** If available, set to **5 minutes** or higher to reduce load and memory churn on free tier.

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

---

## 9. Memory (free tier limit and what to do)

**Why you see "exceeded memory"**

- Render **free tier** gives a small amount of RAM (e.g. **512 MB**). Your service runs:
  - **Main process:** FastAPI (token server) — light.
  - **Subprocess:** LiveKit agent + OpenAI plugin + audio/video libs (`av`, etc.) — **heavy** (often 400 MB–1 GB+).
- One container runs both, so total usage can exceed 512 MB and Render will kill or restart the service.

**Ways to manage or fix it**

| Option | What to do |
|--------|------------|
| **1. Upgrade Render (paid)** | Easiest fix. In Render → your service → **Settings** → change **Instance Type** to a plan with **1 GB or more** RAM (e.g. Starter). Paid plans also avoid spin-down and give more stable performance. |
| **2. Reduce keep-warm frequency** | If you use UptimeRobot/cron to ping `/health`, set the interval to **10–15 minutes** instead of 5. Fewer requests mean slightly less churn; it won’t fix high baseline memory but can reduce extra spikes. |
| **3. Don’t ping too often** | Avoid pinging every 1–2 minutes. That can add load and not help memory. |
| **4. Run only the token server on free tier** | You could run the **token server** (light) on Render free and run the **agent** elsewhere (e.g. a paid VPS, or another provider with more RAM). That requires two deploys and the agent URL configured for LiveKit. |

**Optimizations applied in the repo (to stay closer to 512 MB):**

- **Lazy-load heavy modules:** `db` (qdrant-client) and `tools_exa` (exa-py) are imported only when their tools are first used, not at agent startup. This defers tens of MB until a user triggers research or local lookup.
- **Noise cancellation optional:** The `livekit-plugins-noise-cancellation` package is **not** installed by default (commented out in `requirements.txt`). The agent runs without it; if you add it back, noise cancellation is enabled automatically. Saves ~50–100 MB on free tier.
- **Health routes:** `GET/HEAD /` and `/health` avoid 405 and reduce unnecessary restarts.

**Summary:** With these changes, the service has a better chance of fitting in 512 MB under light use. Under load or with many tools in use, you may still need a **paid instance with more RAM** for stability.

---

## 10. Do you need Render? MCP and sub‑1s latency

**Is Render necessary?**

- **For this setup (LiveKit + voice agent in the cloud):** You need *some* server that:
  - Serves **tokens** (HTTP).
  - Runs the **LiveKit agent** as a **long‑running process** that accepts jobs from LiveKit over WebSockets.
- Render is one way to host that. Alternatives: **Fly.io**, **Railway**, **a small VPS** (DigitalOcean, etc.), or **paid Render**. The agent must be a persistent process (or scale-to-zero that wakes on demand); it can’t be “serverless” in the usual sense because LiveKit expects a worker to be connected.

**MCP (Model Context Protocol)**

- **MCP** is for **tools and context** that a model can call (APIs, data sources, etc.). It doesn’t replace the need for a **voice pipeline**.
- You can:
  - Keep the **voice agent** on Render (or another host) to handle LiveKit and OpenAI Realtime.
  - Run an **MCP server** somewhere else (e.g. your machine, a serverless function, or a small service) that the agent or the model calls for tools/knowledge.
- So: MCP is **in addition to** the voice host, not a substitute for it.

**Sub‑1s response time**

- To get **below ~1 second** response time you need:
  - **No cold start** — the agent must already be running (paid/warm instance or keep-warm pings).
  - **Enough RAM/CPU** — so the process isn’t throttled or killed (free tier often fails here).
- So for sub‑1s, plan on either:
  - A **paid / larger instance** (e.g. Render with more RAM, or a small VPS), or
  - A **free keep-warm** setup plus accepting that **memory limits on free tier** may still cause restarts or OOM.

**Should you pay?**

- **Use free tier** if: You’re okay with possible memory restarts, cold starts, and retrying sometimes.
- **Use a paid plan** (e.g. Render with 1 GB+ RAM) if: You want the voice agent stable, no OOM, and better chance of sub‑1s when the instance is warm.
