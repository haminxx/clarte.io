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
| **DEEPGRAM_API_KEY** | Backend only (`voice-agent/.env` or **Render** env) | Agent – **required** for TTS (Deepgram Aura). If missing, the agent logs a warning and TTS fails (no audio). |

**Where to set API keys:**

- **Render (production):** Dashboard → your service → **Environment**. Add `DEEPGRAM_API_KEY`, `OPENAI_API_KEY`, `LIVEKIT_*`, `EXA_API_KEY` here. The agent runs on Render, so it reads these at runtime. Do **not** put backend secrets in the repo or frontend env.
- **Local:** Copy `voice-agent/.env.example` to `voice-agent/.env` and set all keys. Run the agent with `python agent.py dev` or `python start_render.py`.
- **GitHub:** Use GitHub only for **frontend** build-time vars if you deploy Next.js via Actions (e.g. `NEXT_PUBLIC_LIVEKIT_URL`, `NEXT_PUBLIC_VOICE_AGENT_URL`). The voice agent runs on Render (or your host), so backend keys go in **Render** (or your host’s env), not in GitHub Secrets for the agent.

- **Live site (Firebase):** For the deployed website, set `NEXT_PUBLIC_VOICE_AGENT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` where the site is built (e.g. GitHub Actions secrets used by the Firebase Hosting workflow) so the static build contains the correct URLs; otherwise the demo will try `/api/token`, which does not exist on static hosting.

**Tier 1 only:** `OPENAI_API_KEY`, `EXA_API_KEY`, `NEXT_PUBLIC_VOICE_AGENT_URL`. No LiveKit needed.

**Tier 2/3:** Add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`, and **`DEEPGRAM_API_KEY`** (required for agent to speak).

**Voice profiles (optional):** For custom/cloned Deepgram voices (dashboard, desktop, iOS), the token server and agent use Firestore. Set `FIREBASE_SERVICE_ACCOUNT` (JSON string) in the token server (and agent) environment. Authenticated clients can create/list/update/delete records in the `voiceProfiles` collection and pass `voice_profile_id` when requesting a token; the agent will use the profile's `deepgram_model` when `status == "ready"`.

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
   - `OPENAI_API_KEY`, `DEEPGRAM_API_KEY`, `EXA_API_KEY`
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
   - `OPENAI_API_KEY` (secret)
   - **`DEEPGRAM_API_KEY`** (secret) — **required** for the agent to speak. Get it from [Deepgram Console](https://console.deepgram.com/). Without it, the agent will join the room but produce no audio.
   - `EXA_API_KEY` (secret)

After deploy, copy the Render URL (e.g. `https://your-service.onrender.com`) and set:
- **Frontend** `.env.local`: `NEXT_PUBLIC_VOICE_AGENT_URL=https://your-service.onrender.com` (no trailing slash)
- **GitHub** → Settings → Secrets → Actions: add `NEXT_PUBLIC_VOICE_AGENT_URL` and `NEXT_PUBLIC_LIVEKIT_URL` so the built site can connect.

**Note:** `runtime.txt` pins Python 3.12 (LiveKit requires Python < 3.14). Noise cancellation is disabled to reduce memory usage on Render.

## Troubleshooting

### Agent doesn't respond (Ghost Call)

If the button works but the agent never speaks or responds:

1. **DEEPGRAM_API_KEY** – The agent uses Deepgram Aura for TTS. If the key is missing or invalid, the agent will log `DEEPGRAM_API_KEY is not set` (or a Deepgram init error) and no audio will be produced. Set it in **Render** → your service → Environment (or in `voice-agent/.env` for local runs). Get a key at [Deepgram Console](https://console.deepgram.com/).

2. **Render logs** – Render Dashboard → your service → Logs. Start a call and watch for:
   - `entrypoint started` → agent received the job from LiveKit
   - `participant_connected: <identity>` → agent sees the user in the room
   - `Token issued for room=...` → token server received the request
   - If you see `entrypoint started` but no `participant_connected` → agent runs but user never joins; check frontend token and `NEXT_PUBLIC_LIVEKIT_URL`
   - If you see nothing → agent subprocess may not be starting; check Render env (`LIVEKIT_URL`, `OPENAI_API_KEY`, `DEEPGRAM_API_KEY`, etc.)

### No audio from agent

1. **DEEPGRAM_API_KEY** – Must be set where the **agent** runs (Render → Environment, or `voice-agent/.env` locally). If missing, the agent logs a warning and Deepgram TTS returns no audio. Not in GitHub Secrets (those are for frontend build).

2. **Render logs** – Render Dashboard → your service → Logs. Start a call and watch for:
   - `entrypoint started` → agent received the job
   - `Using Deepgram TTS (model=...)` → TTS configured
   - `participant_connected` → agent sees the user
   - `track_subscribed` → agent is receiving your audio
   - Any `ERROR`, `Exception`, or `Deepgram` messages

3. **Browser DevTools** – F12 → Network: confirm WebSocket to LiveKit URL. Console: check for LiveKit or audio errors. Application → Permissions: ensure microphone is allowed.

4. **Render cold start** – Free tier sleeps after ~15 min. The frontend warms up via `/health` before the token request. If the first call fails, wait ~30 seconds and try again.

5. **OpenAI credits** – Realtime API requires a paid account. Add credits at [platform.openai.com](https://platform.openai.com) → Billing.

6. **Mic not working** – Grant microphone permission when prompted. If "mic off" appears, refresh and allow access before starting the call.

7. **Out of memory** – Noise cancellation is disabled to reduce memory. If OOM persists, upgrade Render to a plan with more RAM (e.g. 2GB+).

### Deepgram TTS

- **No audio** – Ensure `DEEPGRAM_API_KEY` is set in **Render** (Dashboard → your service → Environment) or in `voice-agent/.env` for local runs. The agent does not read GitHub Secrets for backend keys.
- **Invalid key** – If the key is wrong or expired, the agent will log a Deepgram error on first TTS use. Get a key at [Deepgram Console](https://console.deepgram.com/).
- **Voice models** – Demo uses Aura-2 models (e.g. `aura-2-thalia-en`). See [Deepgram TTS docs](https://developers.deepgram.com/docs/tts) for available models.

## TTS alternatives (low latency + emotion)

The agent uses **Deepgram Aura** for TTS (low latency, multiple voices/languages). To try other providers, add the plugin to `requirements.txt`, set the provider's API key(s), and branch in `agent.py` to instantiate the chosen TTS.

| Provider | LiveKit plugin | Latency | Notes |
|----------|----------------|---------|-------|
| **Deepgram Aura** (current) | `livekit-agents[deepgram]` | 100–250 ms | Aura-2 streaming; set `DEEPGRAM_API_KEY`. |
| **Hume Octave** | `livekit-agents[hume]` | ~100 ms (Octave 2) | Natural-language acting instructions. Set `HUME_API_KEY`. |
| **PlayHT (PlayAI)** | `livekit-agents[playai]` | ~200–400 ms TTFA | Requires `PLAYHT_API_KEY` and `PLAYHT_USER_ID`. |
| **Cartesia Sonic-3** | `livekit-agents[cartesia]` | Low-latency streaming | 60+ emotions. |
| **ElevenLabs** | `livekit-agents[elevenlabs]` | 150–500 ms | High quality; set `ELEVEN_API_KEY`. |

## Language support (English / Korean / more)

The agent responds in the same language as the user. Supported languages: **English (en)**, **Korean (ko)**, **Spanish (es)**, **Chinese (zh)**, **Japanese (ja)**, **Hindi (hi)**.

- **Frontend toggle** – Use the language selector next to the voice selector before connecting. The selected language is passed in the token metadata.
- **Mid-call switch** – The user can say "speak Korean" or "한국어로 말해줘" and the agent will call `switch_to_korean`. Similarly, "speak English" triggers `switch_to_english`.
- **Deepgram** – Language is set from metadata for correct pronunciation. Aura-2 models support multiple languages; choose the matching voice (e.g. `aura-2-thalia-en` for English).

## Latency tuning (target: under 1 second)

**Current latency:** ~1–3 seconds (OpenAI Realtime + Deepgram Aura TTS pipeline).

**Target:** Under 1 second for first response.

### Latency sources

1. **OpenAI Realtime:** Speech understanding + text generation.
2. **Deepgram Aura TTS:** Text → audio synthesis + streaming (100–250 ms typical).
3. **Network:** Render ↔ LiveKit ↔ client.
4. **Turn detection:** When the model decides the user has finished speaking.

### Applied

- **Deepgram Aura-2** – Low-latency streaming TTS.
- **Prompt trimmed ~30%** – Fewer input tokens.
- **Keep-warm** – `.github/workflows/render-keep-warm.yml` pings `/health` every 10 min. Set `VOICE_AGENT_URL` secret.
- **Instrumentation** – Timing logs in `agent.py` tts_node. See `PIPELINE_AND_LATENCY.md`.

### Options to explore

| Option | Description | Expected impact |
|--------|-------------|-----------------|
| **Shorter prompt** | Reduce `EXECUTIVE_ASSISTANT_PROMPT` size to cut input tokens. | Small. |
| **Render region** | Run Render in a region close to LiveKit (e.g. same cloud/region). | Small–moderate. |
| **Alternative TTS** | Hume, PlayHT, or Cartesia for different latency/quality trade-offs. | Varies. |

### Recommended order

1. **Infrastructure:** Check Render region vs LiveKit region.
2. **Measure:** Use the latency logs in `agent.py` to see LLM→TTS timing.
3. **Prompt:** Trim prompt if input tokens are high.
