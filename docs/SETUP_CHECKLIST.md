# Clarte setup checklist

Use this after creating a new Firebase project and a Render service.

---

## 1. Firebase (new project: clarte-8aece)

The app is already configured to use **clarte-8aece** (see `lib/firebase.ts` and `.firebaserc`).

### Switch Firebase account (your machine)

You cannot “log in to another Firebase” from code. Do this in your terminal:

```bash
firebase logout
firebase login
```

Sign in with the Google account that owns the **clarte-8aece** project.

### Service account for GitHub Actions deploy

1. Firebase Console → Project **clarte-8aece** → Project settings (gear) → **Service accounts**.
2. **Generate new private key** → download the JSON file.
3. GitHub → your repo → **Settings** → **Secrets and variables** → **Actions**.
4. **New repository secret**:
   - Name: `FIREBASE_SERVICE_ACCOUNT_CLARTE_8AECE`
   - Value: **entire contents** of the downloaded JSON file (one line is fine).

### Optional: env for local/Firebase builds

In project root `.env.local` (and in GitHub Actions secrets if you use them for build):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Values: Firebase Console → Project settings → Your apps → Web app config.

---

## 2. Render (voice-agent backend)

Service ID you created: `srv-d692mn0gjchc73dfcivg`.

### In Render dashboard

1. Open your **Web Service**.
2. **Settings** → **Environment**:
   - `LIVEKIT_URL` = `wss://clarte-nrk5tnrq.livekit.cloud`
   - `LIVEKIT_API_KEY` = (your LiveKit API key, mark Secret)
   - `LIVEKIT_API_SECRET` = (your LiveKit API secret, mark Secret)
   - `OPENAI_API_KEY` = (your OpenAI key for Realtime API, mark Secret) — **Render only** (agent runs here)
   - `EXA_API_KEY` = (your Exa key, mark Secret)
3. **Build & Deploy**:
   - **Root Directory:** `voice-agent`
   - **Build Command:** `pip install -r requirements.txt && python agent.py download-files`
   - **Start Command:** `python start_render.py`
4. Deploy and copy the service URL (e.g. `https://clarte-xxxx.onrender.com`).

### Connect frontend to Render

- **Local:** In project root `.env.local`:
  - `NEXT_PUBLIC_VOICE_AGENT_URL` = your Render URL (no trailing slash)
  - `NEXT_PUBLIC_LIVEKIT_URL` = `wss://clarte-nrk5tnrq.livekit.cloud`
- **GitHub Actions (so deploy builds work):** Repo → Settings → Secrets and variables → Actions → add:
  - `NEXT_PUBLIC_VOICE_AGENT_URL` = your Render URL
  - `NEXT_PUBLIC_LIVEKIT_URL` = `wss://clarte-nrk5tnrq.livekit.cloud`

---

## 3. Summary

| What | Where |
|------|--------|
| Firebase project | **clarte-8aece** (already in code) |
| Firebase login | Run `firebase logout` then `firebase login` in terminal with the account that owns clarte-8aece |
| Deploy secret | GitHub secret `FIREBASE_SERVICE_ACCOUNT_CLARTE_8AECE` = full service account JSON |
| Voice backend | Render Web Service, root `voice-agent`, start `python start_render.py` |
| Frontend → voice | `NEXT_PUBLIC_VOICE_AGENT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` in `.env.local` and GitHub secrets |

After this, `npm run build` and `firebase deploy` (or push to `v0/clarte_main` for GitHub deploy) will use the new Firebase project, and the site will use Render for voice tokens.
