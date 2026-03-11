# Clarte Demo Voice AI – Pipeline & Troubleshooting

## Voice demo not working?

The call box depends on **two build-time env vars** and a **running Render service**:

1. **Frontend (site build):** `NEXT_PUBLIC_LIVEKIT_URL` and `NEXT_PUBLIC_VOICE_AGENT_URL` must be set where the site is built (e.g. GitHub Actions secrets, `.env.local`). If either is missing you will see:
   - **"Voice is not configured. Set NEXT_PUBLIC_LIVEKIT_URL"** → add LiveKit WebSocket URL and rebuild.
   - **"Cannot reach voice service"** or **"Token endpoint not found. For production (e.g. Firebase Hosting)..."** → set `NEXT_PUBLIC_VOICE_AGENT_URL` to your Render URL (no trailing slash) and rebuild.

2. **Token server (Render):** The app calls `NEXT_PUBLIC_VOICE_AGENT_URL/token`. If that URL is wrong or the Render service is down/cold, the token request fails. Render must have `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` set.

3. **Agent not joining:** If you join the room but Clarte never speaks (`remoteCount` stays 0), the agent on Render is not joining. Check Render env: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`, `DEEPGRAM_API_KEY`, and Render logs for "entrypoint started" and "participant_connected".

**Why Clarte might not respond at all:** (1) **Token/connect** — wrong or missing frontend env, Render down, or 503 from `/token`. (2) **Agent never joins** — wrong `LIVEKIT_*` on Render or agent subprocess not running; check logs for `entrypoint started` and `participant_connected`. (3) **Agent joins but is silent** — missing/invalid `OPENAI_API_KEY` or `DEEPGRAM_API_KEY`; check logs for `First LLM text chunk` and `First TTS frame ready`. Use `GET /token/debug` on Render to confirm `livekit_ok` and `deepgram_set`.

See **Frontend Env** and **Render Environment Checklist** below for the full list.

### Which path am I on?

The demo uses **two connection paths**. Which one you get depends on frontend env:

| Path | When | STT + LLM | TTS | What to check if it doesn’t work |
|------|------|-----------|-----|----------------------------------|
| **Path A: LiveKit** | `NEXT_PUBLIC_LIVEKIT_URL` is set and `NEXT_PUBLIC_USE_DIRECT_RELAY` is not `"true"` | OpenAI Realtime (gpt-realtime-1.5) | **Deepgram Aura** | Render: `LIVEKIT_*`, `OPENAI_API_KEY`, **`DEEPGRAM_API_KEY`**. Use `/token/debug` for `livekit_ok` and `deepgram_set`. |
| **Path B: Direct relay** | `NEXT_PUBLIC_LIVEKIT_URL` is unset, or `NEXT_PUBLIC_USE_DIRECT_RELAY=true` | OpenAI Realtime (gpt-realtime-1.5) | **OpenAI native audio** (no Deepgram) | Render: only `OPENAI_API_KEY`. No Deepgram; voice is OpenAI’s. |

If you expect the **Clarte voice** (Deepgram Aura), use **Path A** (set `NEXT_PUBLIC_LIVEKIT_URL` and do not force direct relay). Path B uses OpenAI’s built-in voice and does not use Deepgram.

### Why is my call not working? (checklist)

1. **Is `NEXT_PUBLIC_LIVEKIT_URL` set at build time?** If not, you get "Voice is not configured" immediately.
2. **Using static hosting (e.g. Firebase Hosting)?** You **must** set `NEXT_PUBLIC_VOICE_AGENT_URL` to your Render (or other) token server URL. The client cannot use `/api/token` on a static host because there is no Next.js server — you will get a 404 and the message "Token endpoint not found. For production (e.g. Firebase Hosting), set NEXT_PUBLIC_VOICE_AGENT_URL...".
3. **Is the token server (Render or Next.js server) configured?** It needs `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`. If missing, you get 500/503 from the token endpoint.
4. **Agent env and logs:** If the token works but Clarte never joins or speaks, check Render environment (`LIVEKIT_URL`, `OPENAI_API_KEY`, `DEEPGRAM_API_KEY`) and Render logs (see **Render Logs to Check** below).

---

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
         │                       │  ┌─────────────────────────────┐   │
         │                       │  │ OpenAI Realtime (1.5)      │   │  STT + LLM
         │                       │  └────────┬────────────────────┘   │
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

### Pipeline (Path A) – STT → LLM → TTS

Path A uses **OpenAI Realtime (gpt-realtime-1.5)** for STT and LLM, and **Deepgram Aura** for TTS:

1. **STT:** User mic → LiveKit → Render agent → **OpenAI Realtime (gpt-realtime-1.5)** transcribes audio to text.
2. **LLM:** The same Realtime session produces the text reply (no separate LLM call).
3. **TTS:** Agent sends that text to **Deepgram Aura** (LiveKit plugin) → audio frames → LiveKit → user speaker.

So: **OpenAI Realtime = STT + LLM**; **Deepgram = TTS**. Path B (direct relay) uses only OpenAI Realtime (no LiveKit, no Deepgram); audio out is OpenAI’s native voice.

### STT – LLM – TTS Pipeline (OpenAI Realtime + Deepgram)

- **STT (Speech-to-Text):** User mic → LiveKit → Render agent → **OpenAI Realtime** transcribes audio to text. The same model handles both STT and LLM in one session.
- **LLM:** OpenAI Realtime generates the text reply (same session as STT; no separate LLM call).
- **TTS (Text-to-Speech):** Agent text → **Deepgram Aura** (via LiveKit plugin) → audio frames → LiveKit → user speaker.

The agent uses **half-cascade**: OpenAI Realtime with `modalities=["text"]` (text-only output), and **Deepgram Aura** for all speech synthesis. The LiveKit `deepgram.TTS` plugin sends text to `https://api.deepgram.com/v1/speak?model=<model>` with `DEEPGRAM_API_KEY` in the `Authorization: Token <key>` header and streams audio back. No extra Deepgram setup is required beyond the API key; voice is chosen via metadata from the token request (e.g. `aura-2-thalia-en`).

### OpenAI Realtime model

The agent uses the **gpt-realtime-1.5** model. The relay path (Path B) also uses **gpt-realtime-1.5**. If you need to revert to an older model, set `model="gpt-realtime"` or `model="gpt-4o-realtime-preview"` in `voice-agent/agent.py` and the WebSocket URL in `voice-agent/realtime_relay.py`.

### Deepgram: no voice setup required

You do **not** need to "set up a voice" in the Deepgram console. The demo uses **pre-built Aura-2 model IDs** (e.g. `aura-2-thalia-en`, `aura-2-andromeda-en`, `aura-2-apollo-en`). These work as soon as your project has a valid **`DEEPGRAM_API_KEY`** on Render. Standard Deepgram API keys include TTS access unless you restricted them.

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
| `USE_DEEPGRAM_STT` | Optional | Set to `true` for Deepgram STT + GPT-4o vision + Deepgram TTS (faster STT, screen/camera support). Default: OpenAI Realtime STT+LLM. |

### Render Logs to Check

1. **Token issued:** `Token issued for room=...` → token server OK.
2. **Agent started:** `entrypoint started` → agent received job.
3. **User joined:** `participant_connected: <identity>` → agent sees you.
4. **Audio received:** `track_subscribed: participant=... kind=audio` → agent gets your mic.
5. **TTS configured:** `Using Deepgram TTS (model=aura-2-...)` → TTS initialized.
6. **LLM working:** `[latency] First LLM text chunk received` → OpenAI responded.
7. **TTS working:** `[latency] First TTS frame ready` → Deepgram produced audio.

If you see 1–5 but not 6–7, the issue is **OpenAI** (LLM) or **Deepgram** (TTS).

### When OpenAI works but Clarte is silent

If **OpenAI is using credit** (LLM is being called) but you hear no audio from Clarte, the pipeline is reaching the agent and the failure is likely **TTS (Deepgram)** or timing. Use this sequence:

1. **Confirm the key is visible to the service:** Open `GET https://<your-render-url>/token/debug` in a browser (or use curl). Check that `deepgram_set` is `true`. If it is `false`, `DEEPGRAM_API_KEY` is missing or empty on Render — add it in Render Dashboard → your service → Environment and redeploy.

2. **Check Render logs during a call:** Start a call, speak once, then in Render → Logs look for:
   - **"Using Deepgram TTS (model=aura-2-...)"** → TTS initialized with the selected voice.
   - **"[latency] First LLM text chunk received"** → OpenAI returned text.
   - **"[latency] First TTS frame ready"** → Deepgram returned audio; if you see this but still hear nothing, the issue is likely playback or LiveKit relay.
   - Any **"Deepgram"**, **"DEEPGRAM"**, or **"TTS"** error line → key invalid, model wrong, or API error; fix the key or model and redeploy.

If you see the TTS line and First LLM chunk but never "First TTS frame ready", the failure is between the LLM and Deepgram (e.g. invalid key or Deepgram API error). Try the **Test Deepgram key** step below.

### Test Deepgram key (optional)

To confirm your `DEEPGRAM_API_KEY` works and has TTS access, call Deepgram’s TTS API directly with the same model ID the demo uses (e.g. `aura-2-thalia-en`):

```bash
curl -X POST "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en" \
  -H "Authorization: Token YOUR_DEEPGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test."}' \
  --output test.wav
```

If the request succeeds, you get a `test.wav` file; if you get 401/403 or an error body, the key is invalid or lacks TTS permission. Use the same key value in Render → Environment as `DEEPGRAM_API_KEY`. See [Deepgram TTS docs](https://developers.deepgram.com/docs/text-to-speech) for more.

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

Both must be set for the demo to connect when using **static hosting** (e.g. Firebase Hosting). For Firebase Hosting there is no Next.js server, so `/api/token` does not exist — you must set `NEXT_PUBLIC_VOICE_AGENT_URL` to your Render service URL. When running the Next.js server (e.g. Vercel or `next start`), you can use `/api/token` if `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are set on the server; for production static deploy, always set `NEXT_PUBLIC_VOICE_AGENT_URL`.
