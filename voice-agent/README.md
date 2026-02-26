# Clarte Voice Agent

Executive Assistant voice agent with two paths:

- **Tier 1 (voice-only):** Browser connects to `/realtime` WebSocket relay. No LiveKit. Tools (Exa, stubs) run on relay.
- **Tier 2/3 (screen share, camera):** Browser connects to LiveKit; Python agent joins. Uses same tools.

## Environment check (frontend vs backend)

| Variable | Where | Used by |
|----------|--------|---------|
| **NEXT_PUBLIC_LIVEKIT_URL** | Frontend (e.g. `.env.local`, GitHub Actions secrets) | Browser – which LiveKit server to connect to (e.g. `wss://xxx.livekit.cloud`) |
| **NEXT_PUBLIC_VOICE_AGENT_URL** | Frontend (e.g. `.env.local`, GitHub Actions secrets) | Browser – where to get the token (e.g. `https://your-app.onrender.com`, no trailing slash) |
| **LIVEKIT_URL** | Backend only (`voice-agent/.env` or Render env) | Agent + token server – same WebSocket URL as above |
| **LIVEKIT_API_KEY**, **LIVEKIT_API_SECRET** | Backend only (never in frontend) | Token server + agent – to issue tokens and register with LiveKit |
| **OPENAI_API_KEY**, **EXA_API_KEY** | Backend only (never in frontend) | Agent + relay – Realtime API and Exa search |
| **ELEVEN_API_KEY** | Backend only (optional) | Agent – ElevenLabs TTS for more realistic voice. If set and valid, uses ElevenLabs instead of OpenAI built-in voice. Pre-flight validation prevents runtime crashes from bad keys. |
| **FORCE_OPENAI_VOICE** | Backend only (optional) | Set to `1`, `true`, or `yes` to always use OpenAI built-in voice (bypass ElevenLabs) for debugging. |

**Tier 1 only:** `OPENAI_API_KEY`, `EXA_API_KEY`, `NEXT_PUBLIC_VOICE_AGENT_URL`. No LiveKit needed.

**Tier 2/3:** Add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`.

Frontend vars are baked in at **build time** (Next.js). Backend vars are read at **runtime** by the Python process.

## OpenAI Realtime API – Cost & Pipeline

**Requirement:** OpenAI Realtime API is a paid feature. Add credits at [platform.openai.com](https://platform.openai.com) → Billing.

**Cost (approx.):**
- Audio input: ~$0.06/min
- Audio output: ~$0.24/min
- Text tokens: ~$5/M input, ~$20/M output
- Typical voice conversation: ~$0.30–0.50/min

**Pipeline:** Realtime API is **speech-to-speech** (no separate STT → LLM → TTS). One model handles audio in and out, so latency is ~300–800 ms for first response, often under 1 second.

## Local

1. Copy `.env.example` to `.env` and set:
   - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
   - `OPENAI_API_KEY`, `EXA_API_KEY`
2. Install: `pip install -r requirements.txt` (or `uv sync` if using uv)
3. **Option A – Agent only:** `python agent.py dev`
4. **Option B – Token server + agent (like Render):** `python start_render.py` (token server on port 8080, agent in subprocess)

Frontend: set `NEXT_PUBLIC_VOICE_AGENT_URL=http://localhost:8080` and `NEXT_PUBLIC_LIVEKIT_URL=<your LiveKit URL>`.

## Render

1. Create a **Web Service**, connect this repo.
2. **Root Directory:** `voice-agent`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python -u start_render.py` (the `-u` flag ensures unbuffered logs)
5. **Environment** (in Render dashboard):
   - `PYTHONUNBUFFERED=1` (ensures agent logs appear in Render logs)
   - `LIVEKIT_URL` (e.g. `wss://clarte-nrk5tnrq.livekit.cloud`)
   - `LIVEKIT_API_KEY` (secret)
   - `LIVEKIT_API_SECRET` (secret)
   - `OPENAI_API_KEY` (secret) — **Render only** (not needed in GitHub; agent runs on Render)
   - `EXA_API_KEY` (secret)
   - `ELEVEN_API_KEY` (secret, optional) — ElevenLabs TTS for more realistic voice. Marin → Rachel, Cedar → Adam. Must have Text-to-Speech access. Pre-flight validation falls back to OpenAI if invalid.

After deploy, copy the Render URL (e.g. `https://your-service.onrender.com`) and set:
- **Frontend** `.env.local`: `NEXT_PUBLIC_VOICE_AGENT_URL=https://your-service.onrender.com` (no trailing slash)
- **GitHub** → Settings → Secrets → Actions: add `NEXT_PUBLIC_VOICE_AGENT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` so the built site can connect.

**Note:** `runtime.txt` pins Python 3.12 (LiveKit requires Python < 3.14). Noise cancellation is disabled to reduce memory usage on Render.

## Troubleshooting

### Agent doesn't respond (Ghost Call)

If the button works but the agent never speaks or responds:

1. **Render logs** – Render Dashboard → your service → Logs. Start a call and watch for:
   - `entrypoint started` → agent received the job from LiveKit
   - `participant_connected: <identity>` → agent sees the user in the room
   - `Token issued for room=...` → token server received the request
   - If you see `entrypoint started` but no `participant_connected` → agent runs but user never joins; check frontend token and `NEXT_PUBLIC_LIVEKIT_URL`
   - If you see nothing → agent subprocess may not be starting; check Render env (`LIVEKIT_URL`, `OPENAI_API_KEY`, etc.)

2. **ElevenLabs fallback** – The agent validates `ELEVEN_API_KEY` before use (GET /v1/user). If invalid, expired, or lacking permissions, it logs `ElevenLabs key validation failed, using OpenAI voice` and uses OpenAI built-in voice. The agent will still join and respond. If init fails at runtime, it logs `ElevenLabs init failed, falling back to OpenAI`. Set `FORCE_OPENAI_VOICE=1` to bypass ElevenLabs entirely for debugging.

### No audio from agent

1. **Render logs** – Render Dashboard → your service → Logs. Start a call and watch for:
   - `entrypoint started` → agent received the job
   - `Starting session with OpenAI Realtime API` → Realtime API in use
   - `participant_connected` → agent sees the user
   - `track_subscribed` → agent is receiving your audio
   - Any `ERROR`, `Exception`, or `OpenAI` messages

2. **Browser DevTools** – F12 → Network: confirm WebSocket to LiveKit URL. Console: check for LiveKit or audio errors. Application → Permissions: ensure microphone is allowed.

3. **Render cold start** – Free tier sleeps after ~15 min. The frontend warms up via `/health` before the token request. If the first call fails, wait ~30 seconds and try again.

4. **OpenAI credits** – Realtime API requires a paid account. Add credits at [platform.openai.com](https://platform.openai.com) → Billing.

5. **Mic not working** – Grant microphone permission when prompted. If "mic off" appears, refresh and allow access before starting the call.

6. **Out of memory** – Noise cancellation is disabled to reduce memory. If OOM persists, upgrade Render to a plan with more RAM (e.g. 2GB+).

### ElevenLabs-specific issues

- **Invalid key** – Ensure `ELEVEN_API_KEY` is set exactly (LiveKit plugin expects this name). The key must have Text-to-Speech access. Pre-flight validation calls ElevenLabs `/v1/user`; if it fails, the agent uses OpenAI voice.
- **Voice ID** – Marin → Rachel, Cedar → Adam. Verify these IDs work for your ElevenLabs account.
- **Force OpenAI** – Set `FORCE_OPENAI_VOICE=1` in Render env to always use OpenAI voice and rule out ElevenLabs as the cause.

## Language support (English / Korean)

The agent responds in the same language as the user. Supported languages: **English (en)** and **Korean (ko)**.

- **Frontend toggle** – Use the EN | KO toggle next to the voice selector before connecting. The selected language is passed in the token metadata.
- **Mid-call switch** – The user can say "speak Korean" or "한국어로 말해줘" and the agent will call `switch_to_korean` to update TTS. Similarly, "speak English" triggers `switch_to_english`.
- **ElevenLabs** – When using ElevenLabs TTS, the `language` parameter is set from metadata (en/ko) for correct pronunciation. `eleven_flash_v2_5` supports Korean.

## Latency tuning (target: under 1 second)

**Current latency:** ~1–3 seconds (OpenAI Realtime + ElevenLabs TTS pipeline).

**Target:** Under 1 second for first response.

### Latency sources

1. **OpenAI Realtime:** Speech understanding + text generation.
2. **ElevenLabs TTS:** Text → audio synthesis + streaming.
3. **Network:** Render ↔ LiveKit ↔ client.
4. **Turn detection:** When the model decides the user has finished speaking.

### Options to explore

| Option | Description | Expected impact |
|--------|-------------|-----------------|
| **Lower ElevenLabs streaming_latency** | Reduce from 2 to 0 or 1 in `agent.py`. Lower = faster first chunk, less buffering. | Moderate; may affect quality. |
| **Use eleven_turbo_v2** | Switch from `eleven_flash_v2_5` to `eleven_turbo_v2` if available; optimized for low latency. | Moderate. |
| **Switch back to OpenAI built-in voice** | Disable ElevenLabs when latency is critical; OpenAI Realtime is typically ~300–800 ms. | Large; trades voice quality for speed. |
| **Shorter prompt** | Reduce `EXECUTIVE_ASSISTANT_PROMPT` size to cut input tokens. | Small. |
| **Render region** | Run Render in a region close to LiveKit (e.g. same cloud/region). | Small–moderate. |
| **Hybrid: OpenAI for quick replies, ElevenLabs for long** | Use OpenAI voice for short replies (< 2 sentences) and ElevenLabs for longer ones. | Complex; requires pipeline logic. |

### Recommended order

1. **Quick win:** Lower `streaming_latency` to 0 or 1 for ElevenLabs.
2. **A/B test:** Compare OpenAI-only vs ElevenLabs; measure latency vs quality.
3. **Model:** Try `eleven_turbo_v2` if the LiveKit plugin supports it.
4. **Infrastructure:** Check Render region vs LiveKit region.
