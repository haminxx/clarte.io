# Clarte: Pipecat + Daily + Gemini Setup & API Keys

This document lists the **accounts and API keys** you need to run the new Direct Multimodal Live pipeline (Pipecat, Daily.co, Gemini, Firebase).

---

## 1. **Google Cloud / Gemini (AI model)**

- **What:** Gemini 2.0 / 2.5 Flash Live for native multimodal (audio + video) in the Pipecat bot.
- **Where:** [Google AI Studio](https://aistudio.google.com/) or [Google Cloud Console](https://console.cloud.google.com/).
- **Get key:**
  - **Option A:** [Google AI Studio](https://aistudio.google.com/app/apikey) → “Get API key” → create key (use for development).
  - **Option B:** [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create API key, enable “Generative Language API”.
- **Env (backend):** `GEMINI_API_KEY` or `GOOGLE_API_KEY` in `backend/.env`.

---

## 2. **Daily.co (WebRTC transport)**

- **What:** WebRTC rooms and meeting tokens; frontend and Pipecat bot both join the same Daily room.
- **Where:** [Daily Dashboard](https://dashboard.daily.co/) → Sign up / Log in.
- **Get key:**
  - Dashboard → **Developers** → **API keys** → copy your API key.
- **Subdomain:** Your rooms use your account subdomain (e.g. `clarte.daily.co`). No extra config needed; the API returns room URLs under your subdomain.
- **Env:**
  - **Backend:** `DAILY_API_KEY` in `backend/.env` (used by `server.py` to create rooms and meeting tokens).
- **Docs:** [Daily REST API](https://docs.daily.co/reference/rest-api), [Daily JS](https://docs.daily.co/reference/daily-js).

---

## 3. **Firebase (Auth + Firestore, optional for new pipeline)**

- **What:** Replace Supabase: Firebase Auth (users) and Firestore (data).
- **Where:** [Firebase Console](https://console.firebase.google.com/).
- **Steps:**
  1. Create a project (or use existing).
  2. **Authentication:** Enable Email/Password and optionally Google/GitHub.
  3. **Firestore:** Create database, set rules.
  4. **Project settings → General → Your apps:** Add a Web app → copy the `firebaseConfig` object.
- **Env (frontend):** In `.env.local`:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Backend (Python):** For Firestore from the bot/server use a **service account**: Firebase Console → Project settings → Service accounts → Generate new private key. Then set `GOOGLE_APPLICATION_CREDENTIALS` to that JSON path and use `firebase-admin` in Python.

---

## 4. **Backend URL (frontend → Pipecat server)**

- **What:** Next.js frontend calls the Python backend to create a session (room + token) and the bot joins that room.
- **Env (frontend):** In `.env.local`:
  - `NEXT_PUBLIC_PIPECAT_BACKEND_URL=http://localhost:8000` (local) or your deployed backend URL (e.g. `https://your-pipecat-backend.fly.io`).

---

## Summary table

| Purpose              | Account / product | Key / config              | Where used              |
|----------------------|-------------------|---------------------------|-------------------------|
| AI (multimodal live) | Google Gemini     | `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Backend `bot.py`        |
| WebRTC rooms         | Daily.co          | `DAILY_API_KEY`           | Backend `server.py`     |
| Auth + DB (optional) | Firebase          | Firebase config + service account | Frontend `lib/firebase.ts`, backend `firebase-admin` |
| Backend URL          | Your backend      | `NEXT_PUBLIC_PIPECAT_BACKEND_URL` | Frontend `Room.tsx`     |

---

## Minimal run (no Firebase)

1. **Backend:** Create `backend/.env` with:
   - `GEMINI_API_KEY=<your-gemini-key>`
   - `DAILY_API_KEY=<your-daily-key>`
2. **Backend:** `pip install -r backend/requirements.txt` then `uvicorn server:app --host 0.0.0.0 --port 8000`.
3. **Frontend:** `.env.local` with `NEXT_PUBLIC_PIPECAT_BACKEND_URL=http://localhost:8000`.
4. **Frontend:** Use the new `Room` component (e.g. on a `/voice-room` page); it will POST `/session` to get a room and token, join via Daily, and you can “Share screen” so the Pipecat bot (and Gemini) receive video frames.

---

## File layout (new architecture)

- **Backend:** `backend/bot.py` (Pipecat pipeline), `backend/server.py` (FastAPI, creates Daily room + runs bot), `backend/requirements.txt`.
- **Frontend:** `lib/firebase.ts` (Firebase config), `components/voice/Room.tsx` (Daily join + screen share).
- **Docs:** This file for API keys and setup.
