# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Clarte is a real-time Voice AI platform with two services:
- **Frontend**: Next.js 16 (static export) — marketing pages, Firebase Auth, voice call UI via LiveKit
- **Voice Agent Backend**: Python (FastAPI + LiveKit Agents SDK + OpenAI Realtime API) in `voice-agent/`

### Frontend

- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build` (static export via `output: "export"` in `next.config.mjs`)
- **Lint**: `npm run lint` — calls `eslint .`, but ESLint is **not** in `package.json` dependencies. The command will fail with `eslint: not found`. Next.js 16 removed `next lint`.
- **TypeScript**: `npx tsc --noEmit` — 2 minor errors in `components/particle-orb.tsx` and `components/waveform.tsx` (expected 1 arg, got 0). Build ignores these via `ignoreBuildErrors: true`.
- Firebase config has hardcoded fallback values in `lib/firebase.ts`, so auth pages render without env vars.

### Build requires `.env.local`

`npm run build` (static export) will fail unless `NEXT_PUBLIC_LIVEKIT_URL` is set, because `components/voice/Room.tsx` throws during SSR if it's missing. Create `.env.local` at the project root:

```
NEXT_PUBLIC_LIVEKIT_URL=wss://placeholder.livekit.cloud
NEXT_PUBLIC_VOICE_AGENT_URL=
```

`npm run dev` works without this because the Room component is `"use client"` and only checks on the server side.

### Voice Agent Backend

- Located in `voice-agent/`
- Install: `pip install -r voice-agent/requirements.txt`
- Run locally: `python voice-agent/start_render.py` (starts token server on port 8080 + agent subprocess)
- Requires env vars: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY` (see `voice-agent/README.md`)
- `EXA_API_KEY` is optional (web search feature)

### Package manager

Both `package-lock.json` and `pnpm-lock.yaml` exist. Use `npm` (matches `package-lock.json`).
