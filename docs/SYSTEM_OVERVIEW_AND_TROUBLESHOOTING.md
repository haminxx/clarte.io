# Clarte: How the System Operates & Fixing "Failed to Fetch"

---

## How the current system operates

1. **Website (Firebase Hosting)**  
   User opens clarte.io (static site from `out/`). The page loads; no backend is called until the user clicks **“Start voice call”**.

2. **Session creation**  
   The frontend sends:
   - **Request:** `POST NEXT_PUBLIC_PIPECAT_BACKEND_URL/session`  
     (e.g. `POST https://your-service.onrender.com/session`)
   - **Backend (Render):** Receives the request, calls Daily.co API to create a room and meeting token, starts the Pipecat bot (Gemini + Daily) in the same room, and returns `{ room_url, token }` to the frontend.

3. **Joining the call**  
   The frontend uses Daily.co’s SDK with `room_url` and `token` to join the room. The browser then asks for **microphone (and camera)**. User and bot are in the same Daily room; audio/video go over WebRTC via Daily.

4. **Screen share**  
   When the user clicks **“Share screen”**, the frontend calls `getDisplayMedia()`, then sends the screen track into the Daily call so the Pipecat bot (and Gemini) receive video frames.

5. **Voice AI**  
   The Pipecat bot on Render receives your audio (and screen video if shared), sends it to **Gemini Multimodal Live**, and sends Gemini’s voice response back into the Daily room so you hear it in the browser.

**Flow summary:**  
Browser → `POST BACKEND_URL/session` → Render creates Daily room + runs bot → Browser gets `room_url` + `token` → Browser joins via Daily → Mic/screen → Daily → Bot → Gemini → Back to you.

---

## What “Failed to fetch” means

The browser could not get a response from `BACKEND_URL/session`. Common causes:

- **Wrong or missing backend URL:** The built site still has `NEXT_PUBLIC_PIPECAT_BACKEND_URL` unset or wrong (e.g. `http://localhost:8000`), so the request goes to a URL that doesn’t exist or isn’t reachable.
- **Backend not running:** The Render service is down, sleeping (free tier), or failed to start.
- **Network / CORS:** Your network or browser blocks the request; CORS is already configured on the backend for clarte.io.

The app now shows a clearer message when this happens: *“Could not reach the voice server. Check your connection and that the backend is running (set NEXT_PUBLIC_PIPECAT_BACKEND_URL to your Render URL and rebuild the site).”*

---

## Hands-on tasks to fix “Failed to fetch”

Do these in order:

### 1. Backend (Render)

- **Ensure the backend deploys and runs.**  
  - In Render, set **Environment**: `DAILY_API_KEY`, `GEMINI_API_KEY`.  
  - Ensure `backend/requirements.txt` includes `google-cloud-texttospeech>=2.16.0` (for the `texttospeech_v1` import) and redeploy if you just added it.  
- **Confirm the service is up:**  
  Open `https://YOUR-RENDER-SERVICE.onrender.com/health` in a browser; you should see `{"status":"ok"}`.  
- **Copy the backend URL:**  
  e.g. `https://clarte-pipecat.onrender.com` (no trailing slash). This is the value for `NEXT_PUBLIC_PIPECAT_BACKEND_URL`.

### 2. Frontend build (your machine or CI)

- **Set the backend URL at build time.**  
  In the **project root**, in **`.env.local`**, set:
  - `NEXT_PUBLIC_PIPECAT_BACKEND_URL=https://YOUR-RENDER-SERVICE.onrender.com`  
  (use your real Render URL; this is **not** the Pipecat Cloud API key).
- **Build the site:**  
  `npm run build`  
  This produces the `out/` folder with the URL baked in.
- **Do not** put the Pipecat Cloud API key (`pk_...`) in `NEXT_PUBLIC_PIPECAT_BACKEND_URL`; that variable must be the **backend URL** only.

### 3. Deploy to Firebase

- **Deploy the new build:**  
  `firebase deploy`  
  (after `firebase login` and `firebase init hosting` with `out` as the public directory, as in FIREBASE_HOSTING_SETUP.md.)

After this, the live site will call your Render backend when the user clicks “Start voice call.” If the backend is up and the URL is correct, “Failed to fetch” should go away.

---

## Quick reference

| Component | Role |
|-----------|------|
| **Firebase Hosting** | Serves the static site (clarte.io). |
| **NEXT_PUBLIC_PIPECAT_BACKEND_URL** | Backend **URL** (e.g. Render). Set in `.env.local` before `npm run build`. |
| **Render** | Runs FastAPI + Pipecat bot; creates Daily rooms and returns `room_url` + `token`. |
| **Daily.co** | WebRTC room; browser and bot join the same room. |
| **Pipecat + Gemini** | Bot in the same process on Render; sends/receives audio (and video) via Daily and Gemini. |

For env keys and where to set them (including Firebase login), see **ENV_SETUP_GUIDE.md**.

---

## Push to GitHub and deploy to Firebase

### Push to GitHub

From the project root:

```bash
git add .
git status
git commit -m "Your message"
git push origin v0/clarte_main
```

(Use your branch name if different.)

### Deploy to Firebase Hosting

1. **Set env before building** (in `.env.local` or shell):
   - `NEXT_PUBLIC_PIPECAT_BACKEND_URL=https://YOUR-RENDER-SERVICE.onrender.com`
   - `NEXT_PUBLIC_FIREBASE_*` (all 6) if you use Firebase login.

2. **Build and deploy:**

```bash
npm run build
firebase deploy
```

Your site will be at `https://<project-id>.web.app` (and your custom domain if configured). The deployed site will call your Render backend when users click “Start voice call.”
