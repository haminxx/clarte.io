# Clarte Demo Voice AI – Pipeline & Troubleshooting

## System Architecture

The demo page uses a **LiveKit + Render** pipeline:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Browser (Demo) │────▶│  Render Service  │────▶│  LiveKit Cloud  │
│  - Mic audio    │     │  - Token server  │     │  - WebRTC room  │
│  - Speaker      │     │  - Python agent  │     │  - Audio relay  │
└────────┬────────┘     └────────┬─────────┘     └────────┬───────┘
         │                       │                        │
         │  1. POST /token       │  2. Agent joins room   │
         │◀─────────────────────▶│◀──────────────────────▶│
         │                       │                        │
         │  3. WebRTC connect    │  4. User speaks       │
         │◀──────────────────────────────────────────────▶│
         │                       │                        │
         │                       │  Agent receives audio  │
         │                       │  ┌─────────────────┐   │
         │                       │  │ OpenAI Realtime │   │  STT + LLM
         │                       │  │ (gpt-realtime)  │   │
         │                       │  └────────┬────────┘   │
         │                       │           │            │
         │                       │  ┌────────▼────────┐   │
         │                       │  │ Deepgram Aura   │   │  TTS
         │                       │  │ (aura-2-*)      │   │
         │                       │  └────────┬────────┘   │
         │                       │           │            │
         │  5. Agent speaks      │  Audio frames          │
         │◀──────────────────────────────────────────────▶│
```

### Data Flow

1. **STT (Speech-to-Text):** User mic → LiveKit → Render agent → **OpenAI Realtime** transcribes.
2. **LLM:** OpenAI Realtime generates text response (same model as STT).
3. **TTS (Text-to-Speech):** Agent text → **Deepgram Aura** → audio frames → LiveKit → user speaker.

If you see your speech in the transcript, STT is working. If the agent never speaks, the failure is in **LLM** or **TTS**.

---

## Common Failure: STT Works, LLM/TTS Don't

### Symptom

- Your speech appears in the live transcript (STT works).
- Clarte never responds (no LLM output or no TTS audio).

### Most Likely Causes

| Cause | Where to Fix | What to Check |
|-------|--------------|---------------|
| **DEEPGRAM_API_KEY missing** | Render → Environment | Add `DEEPGRAM_API_KEY` from [Deepgram Console](https://console.deepgram.com/). Without it, TTS returns no audio. |
| **OPENAI_API_KEY invalid or expired** | Render → Environment | Verify key at [platform.openai.com](https://platform.openai.com). Realtime API requires billing credits. |
| **Render cold start** | Wait 30–60 s | Free tier sleeps after ~15 min. First request may timeout. Retry or use keep-warm. |
| **Agent not joining room** | Render Logs | Look for `entrypoint started` and `participant_connected`. If missing, check `LIVEKIT_*` env vars. |

### Render Environment Checklist

In **Render Dashboard → Your Service → Environment**, ensure:

| Variable | Required | Purpose |
|----------|----------|---------|
| `LIVEKIT_URL` | Yes | WebSocket URL (e.g. `wss://xxx.livekit.cloud`) |
| `LIVEKIT_API_KEY` | Yes | LiveKit API key |
| `LIVEKIT_API_SECRET` | Yes | LiveKit API secret |
| `OPENAI_API_KEY` | Yes | OpenAI Realtime API (billing required) |
| `DEEPGRAM_API_KEY` | Yes | Deepgram Aura TTS – **required for agent to speak** |
| `EXA_API_KEY` | Optional | For search_web tool |

### Render Logs to Check

1. **Token issued:** `Token issued for room=...` → token server OK.
2. **Agent started:** `entrypoint started` → agent received job.
3. **User joined:** `participant_connected: <identity>` → agent sees you.
4. **Audio received:** `track_subscribed: participant=... kind=audio` → agent gets your mic.
5. **TTS configured:** `Using Deepgram TTS (model=aura-2-...)` → TTS initialized.
6. **LLM working:** `[latency] First LLM text chunk received` → OpenAI responded.
7. **TTS working:** `[latency] First TTS frame ready` → Deepgram produced audio.

If you see 1–5 but not 6–7, the issue is **OpenAI** (LLM) or **Deepgram** (TTS).

---

## Quick Fixes

1. **Set DEEPGRAM_API_KEY on Render** – Most common fix when agent is silent.
2. **Verify OPENAI_API_KEY** – Ensure billing is enabled and key is valid.
3. **Warm up Render** – Hit `https://your-service.onrender.com/health` before starting a call.
4. **Check keep-warm** – `.github/workflows/render-keep-warm.yml` pings `/health` every 10 min. Set `VOICE_AGENT_URL` in GitHub Secrets.

---

## Frontend Env (GitHub / .env.local)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit WebSocket URL |
| `NEXT_PUBLIC_VOICE_AGENT_URL` | Render URL (no trailing slash) for token |

Both must be set for the demo to connect.
