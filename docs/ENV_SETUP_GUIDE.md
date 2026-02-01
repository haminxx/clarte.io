# Clarte: Environment Variables – Where and What

**Important:** `NEXT_PUBLIC_PIPECAT_BACKEND_URL` is the **URL** of your backend (e.g. your Render Web Service), **not** the Pipecat Cloud API key. The Pipecat Cloud API key (`pk_...`) is a separate credential used on the **backend** if you use Pipecat Cloud; it is **not** the value for `NEXT_PUBLIC_PIPECAT_BACKEND_URL`.

---

## 1. NEXT_PUBLIC_PIPECAT_BACKEND_URL (frontend)

| Key | Value | Notes |
|-----|--------|--------|
| `NEXT_PUBLIC_PIPECAT_BACKEND_URL` | **Your backend URL** (no trailing slash) | e.g. `https://clarte-pipecat.onrender.com` — the URL of your Render Web Service, **not** the Pipecat API key |

**Where to set:** In **`.env.local`** in the project root **before** running `npm run build`, so the static site is built with this URL. Then deploy the `out/` folder to Firebase.

**Where to get the value:** Render Dashboard → your Web Service → copy the **URL** at the top (e.g. `https://clarte-pipecat.onrender.com`).

---

## 2. Pipecat Cloud API key (backend, optional)

If you use **Pipecat Cloud** (hosted session API), the key goes on the **backend** (e.g. Render env), not in the frontend:

| Key | Value | Where |
|-----|--------|--------|
| `PIPECAT_API_KEY` or similar | Your Pipecat Cloud key (e.g. `pk_...`) | Render → Environment (backend only) |

**Current Clarte setup:** The backend on Render creates Daily rooms and runs the Pipecat bot **in-process**; it does **not** call Pipecat Cloud’s API. So you do **not** need to set the `pk_` key for the current “Start voice call” flow. You only need:

- **Frontend:** `NEXT_PUBLIC_PIPECAT_BACKEND_URL` = your **Render Web Service URL**.
- **Backend (Render):** `DAILY_API_KEY`, `GEMINI_API_KEY` (and `google-cloud-texttospeech` in `requirements.txt` for deploy).

---

## 3. Render.com (backend only)

**Where:** Render Dashboard → your Web Service → **Environment**

| Key | Value |
|-----|--------|
| `DAILY_API_KEY` | Your Daily.co API key |
| `GEMINI_API_KEY` | Your Google AI Studio API key |

---

## 4. Firebase (frontend build)

Set in **`.env.local`** before `npm run build` (see FIREBASE_HOSTING_SETUP.md):

- `NEXT_PUBLIC_PIPECAT_BACKEND_URL` = Render URL (above).
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` = from Firebase Console → Project settings → Your apps → Web app.

---

## 5. Summary

| Variable | Meaning | Where to set |
|----------|----------|----------------|
| `NEXT_PUBLIC_PIPECAT_BACKEND_URL` | **Backend URL** (e.g. `https://xxx.onrender.com`) | `.env.local` before build |
| Pipecat Cloud key (`pk_...`) | API key for Pipecat Cloud | Backend env only (not used in current Clarte backend) |
| `DAILY_API_KEY`, `GEMINI_API_KEY` | Backend API keys | Render → Environment |
