# Deploy Clarte Pipecat Backend on Render.com

Render runs the backend as a **persistent Web Service** (not serverless), so long-running Pipecat/WebRTC processes are supported.

## 1. Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Web Service**.
2. Connect your GitHub repo (`haminxx/clarte.io` or your fork).
3. **Root Directory:** set to `backend` (so Render uses this folder for build and start).
4. **Runtime:** Python 3.
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** Leave empty; Render will use the **Procfile** (`web: uvicorn server:app --host 0.0.0.0 --port $PORT`).
7. **Instance type:** Free or paid (Free tier may spin down after inactivity; paid keeps it up).

## 2. Environment Variables (Render Dashboard)

In the Web Service → **Environment** → **Environment Variables**, add:

| Key | Value | Notes |
|-----|--------|--------|
| `DAILY_API_KEY` | Your Daily.co API key | Required for rooms + tokens |
| `GEMINI_API_KEY` | Your Google AI Studio API key | Required for Pipecat bot |
| `PORT` | (set by Render) | Do not override |
| `CORS_ORIGINS` | (optional) | Extra origins, comma-separated |

Optional for Firebase (if you use it from the bot later): `GOOGLE_APPLICATION_CREDENTIALS` or paste service account JSON as env.

## 3. Deploy

Save; Render will build and deploy. Your backend URL will be:

**`https://<YOUR-SERVICE-NAME>.onrender.com`**

(e.g. `https://clarte-pipecat.onrender.com` if you named the service `clarte-pipecat`).

Test: open `https://<YOUR-SERVICE-NAME>.onrender.com/health` — you should see `{"status":"ok"}`.

## 4. Vercel Frontend – Set Backend URL

In **Vercel** (project for https://www.clarte.io):

1. **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `NEXT_PUBLIC_PIPECAT_BACKEND_URL`
   - **Value:** `https://<YOUR-SERVICE-NAME>.onrender.com` (your Render Web Service URL, **no trailing slash**)
   - **Environments:** Production (and Preview if you want).

3. **Redeploy** the frontend so the new env is applied.

After that, “Start voice call” on https://www.clarte.io will call your Render backend and create Daily sessions.

## 5. CORS

The backend allows requests from:

- `https://www.clarte.io`
- `https://clarte.io`
- `http://localhost:3000` and `http://127.0.0.1:3000` (local dev)

To add more origins, set `CORS_ORIGINS` on Render (e.g. `https://staging.clarte.io`).
