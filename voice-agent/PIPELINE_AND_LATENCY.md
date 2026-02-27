# Clarte Voice Agent – System Pipeline & Latency

## Deployment Status (Push to v0/clarte_main)

| Platform | Trigger | Status |
|----------|---------|--------|
| **GitHub** | Manual push | Done – pushed commit `e951723` |
| **Firebase Hosting** | Auto on push via `firebase-hosting-merge.yml` | Deploys automatically |
| **Render** | Auto on push (if repo connected) | Deploys automatically |

---

## System Pipeline Map

```mermaid
flowchart TB
    subgraph User [User Browser]
        Mic[Microphone]
        Speaker[Speaker]
    end

    subgraph Firebase [Firebase Hosting]
        App[Next.js App]
    end

    subgraph Render [Render - Voice Agent]
        Token[Token Server /token]
        Health[/health]
        Relay[WebSocket /realtime]
        Agent[LiveKit Agent]
        Tools[Tools: Exa, check_schedule, log_feedback]
    end

    subgraph LiveKit [LiveKit Cloud]
        Room[WebRTC Room]
    end

    subgraph OpenAI [OpenAI]
        Realtime[Realtime API]
    end

    subgraph ElevenLabs [ElevenLabs]
        TTS[TTS]
    end

    subgraph Exa [Exa]
        Search[Exa Search]
    end

    Mic --> App
    App --> Token
    App --> Relay
    App --> Room
    Token --> Room
    Room --> Agent
    Agent --> Realtime
    Realtime --> TTS
    TTS --> Agent
    Agent --> Room
    Room --> Speaker
    Agent --> Tools
    Tools --> Search
    Relay --> Realtime
```

### Two Connection Paths

| Path | When | Flow |
|------|------|------|
| **Path A: LiveKit** | Screen share, camera, or full features | Browser → Firebase (app) → Token from Render → LiveKit → Render Agent (OpenAI + ElevenLabs) |
| **Path B: Relay** | Voice-only (Tier 1) | Browser → Firebase (app) → WebSocket to Render `/realtime` → OpenAI Realtime |

---

## Latency by Platform (Excel-style)

| Platform / Component | Latency (ms) | Notes |
|----------------------|--------------|-------|
| **Firebase Hosting** | 50–200 | App load, static assets |
| **Render – Token** | 100–500 | Cold start ~15 min; warm ~100–500 ms |
| **Render – Health** | 50–300 | Warmup before token |
| **LiveKit** | 50–150 | WebRTC signaling, join room |
| **OpenAI Realtime** | 300–800 | Speech understanding + text generation (first response) |
| **ElevenLabs TTS** | 150–500 | `streaming_latency=1`; `eleven_turbo_v2` (EN) / `eleven_flash_v2_5` (KO) |
| **Exa (search_web)** | 500–2000 | When tool called in Step 3 |
| **Network (Browser ↔ Render)** | 50–200 | Depends on region |
| **Network (Render ↔ LiveKit)** | 20–100 | Same cloud |
| **Network (Render ↔ OpenAI)** | 50–150 | API |
| **Network (Render ↔ ElevenLabs)** | 50–150 | API |
| **Turn detection** | 200–600 | When user stops speaking |

---

## End-to-End Latency (Summary)

| Scenario | Typical (ms) | Range (ms) |
|----------|---------------|------------|
| **First response (voice-only)** | 1000–2000 | 800–3000 |
| **First response (with ElevenLabs)** | 1500–2500 | 1200–3500 |
| **Tool call (search_web)** | +2000 | +1500–3000 |
| **Cold start (Render)** | +5000–30000 | Mitigated by keep-warm cron (see below) |

### Current pipeline (from README)

- **Target:** ~1 s for first response  
- **Observed:** ~1–3 s (OpenAI Realtime + ElevenLabs TTS)

---

## Latency Breakdown

```
User speaks → [Turn detection 200–600ms] → User stops
     ↓
[OpenAI Realtime 300–800ms] → Text generated
     ↓
[ElevenLabs TTS 200–600ms] → Audio synthesized
     ↓
[Network 50–200ms] → Audio to user
     ↓
User hears response
```

**Total: ~750–2200 ms** (typical)

---

## Cold-Start Mitigation

Render services sleep after ~15 min idle, adding 5–30 s to the first request. Mitigations:

| Method | Setup |
|--------|-------|
| **GitHub Actions** | `.github/workflows/render-keep-warm.yml` pings `/health` every 10 min. Set `VOICE_AGENT_URL` secret (e.g. `https://your-app.onrender.com`) in repo Settings → Secrets. |
| **UptimeRobot** | Add monitor for `https://your-app.onrender.com/health`; check interval 5 min. No code changes. |
| **Render Cron** | If on paid plan, add cron job `*/5 * * * *` to curl `/health`. |

---

## Instrumentation

Timing logs are added in `agent.py` (tts_node) to measure:

- **First LLM text chunk:** Logged when the first text chunk arrives from OpenAI Realtime (indicates user speech → LLM processing complete).
- **First TTS frame:** Logged when the first audio frame is ready from ElevenLabs. The log includes `LLM->TTS` duration in ms.

Enable debug logging to see these: `LOG_LEVEL=DEBUG` or set logger to INFO. Example output:

```
[latency] First LLM text chunk received
[latency] First TTS frame ready (LLM->TTS: 245 ms)
```

Use these to pinpoint whether the bottleneck is OpenAI Realtime, ElevenLabs, or network.

---

## Applied Optimizations

| Change | Status |
|--------|--------|
| `streaming_latency=1` | Applied (1 adds small buffer to reduce choppy playback; try 2 if lag persists) |
| `eleven_turbo_v2` (English) / `eleven_flash_v2_5` (Korean) | Applied |
| Prompt trimmed ~30% | Applied |
| Keep-warm workflow | `.github/workflows/render-keep-warm.yml`; set `VOICE_AGENT_URL` secret |

---

## Further Optimization Options

| Option | Impact | Trade-off |
|--------|--------|-----------|
| **Hume Octave** | ~100–200 ms TTFA | Add `livekit-agents[hume]`, `HUME_API_KEY`; different voice quality |
| **PlayHT 2.0 Turbo** | 200–400 ms TTFA | `livekit-agents[playai]`; requires `PLAYHT_API_KEY` |
| **Cartesia Sonic-3** | Low-latency streaming | `livekit-agents[cartesia]`; 60+ emotions |
| Use OpenAI built-in voice | Large | `FORCE_OPENAI_VOICE=1`; trades quality for speed |
| Render region near LiveKit | Small–moderate | Set region in Render dashboard |
| `streaming_latency=2` | Smoother playback | If audio still lags/freezes, try 2 for more buffer; region alignment helps |
