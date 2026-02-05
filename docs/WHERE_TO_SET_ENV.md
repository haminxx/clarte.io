# Where to set environment variables

For a **full checklist** (Render + GitHub + .env files), see **GITHUB_AND_ENV_SUMMARY.md**. For **Render build/start and env vars**, see **RENDER_SETUP.md**.

---

## LiveKit (URL, API key, API secret)

| Variable | Where to set it | Never put in |
|----------|-----------------|--------------|
| `LIVEKIT_URL` | **voice-agent** `.env` (local) or your host’s env (e.g. Render) | GitHub, frontend, Firebase |
| `LIVEKIT_API_KEY` | **voice-agent** `.env` (local) or your host’s env (e.g. Render) | GitHub, frontend, Firebase |
| `LIVEKIT_API_SECRET` | **voice-agent** `.env` (local) or your host’s env (e.g. Render) | GitHub, frontend, Firebase |

- **Local:** In `voice-agent/` copy `.env.example` to `.env` and fill in your LiveKit URL, API key, and API secret. The `.env` file is gitignored; never commit it.
- **Deployed voice-agent (e.g. Render):** In the service’s dashboard, add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` as environment variables. Do not put these in GitHub.

The **frontend** only needs the **public** LiveKit URL so the browser can connect. It must **never** see the API key or secret.

---

## Frontend (Next.js) – public URLs only

| Variable | Where to set it |
|----------|------------------|
| `NEXT_PUBLIC_LIVEKIT_URL` | Project root `.env.local` (local). For **GitHub Actions** (Firebase Hosting build): add as a **repository secret** in GitHub. |
| `NEXT_PUBLIC_VOICE_AGENT_URL` | Project root `.env.local` (local). For **GitHub Actions**: add as a **repository secret** in GitHub. |

- **Local:** In the project root, `.env.local` with `NEXT_PUBLIC_LIVEKIT_URL` and `NEXT_PUBLIC_VOICE_AGENT_URL` (e.g. `http://localhost:8080` for the token server).
- **GitHub:** Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add:
  - `NEXT_PUBLIC_LIVEKIT_URL` = your LiveKit WebSocket URL (e.g. `wss://clarte-xxx.livekit.cloud`)
  - `NEXT_PUBLIC_VOICE_AGENT_URL` = your token server URL (e.g. `https://your-app.onrender.com` or `http://localhost:8080` for local-only)
- **Firebase:** You do **not** need to put LiveKit or voice-agent URLs (or any secrets) in Firebase Console for Hosting. The build runs in GitHub Actions, which uses the secrets above.

---

## Summary

- **Voice-agent (Python):** `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (+ `OPENAI_API_KEY`, `EXA_API_KEY`) → in `voice-agent/.env` locally, or in Render (or other host) env for deployment. Never in GitHub or the frontend.
- **GitHub:** Only the two **public** URLs as repository secrets: `NEXT_PUBLIC_LIVEKIT_URL`, `NEXT_PUBLIC_VOICE_AGENT_URL`.
- **Firebase:** No need to add these; the workflow uses GitHub secrets when building.
