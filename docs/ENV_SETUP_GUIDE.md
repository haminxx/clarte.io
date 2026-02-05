# Clarte: Environment Variables

Voice is the **speech-first** pipeline (LiveKit + Python voice-agent). Auth and data use **Firebase**.

---

## Voice (LiveKit + voice-agent)

| Variable | Where | Meaning |
|----------|--------|--------|
| `NEXT_PUBLIC_LIVEKIT_URL` | Frontend `.env.local` or CI | LiveKit server URL (e.g. `wss://your-project.livekit.cloud`) |
| `NEXT_PUBLIC_VOICE_AGENT_URL` | Frontend `.env.local` or CI | Token server base URL (e.g. `https://your-voice-agent.onrender.com`) |

In **voice-agent** `.env` (Python):

- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` — LiveKit Cloud
- `OPENAI_API_KEY` — OpenAI Realtime
- `EXA_API_KEY` — Exa (research path)

See **docs/VOICE_AGENT_SETUP.md** for full setup.

---

## Firebase (frontend)

For auth/dashboard, set in `.env.local` before `npm run build`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`

From Firebase Console → Project settings → Your apps → Web app.

---

## Summary

| Variable | Meaning | Where |
|----------|---------|--------|
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit server (voice) | Frontend `.env.local` or CI |
| `NEXT_PUBLIC_VOICE_AGENT_URL` | Token server URL (voice) | Frontend `.env.local` or CI |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase config | Frontend `.env.local` |
