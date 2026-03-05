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

    subgraph Deepgram [Deepgram]
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
| **Path A: LiveKit** | `LIVEKIT_URL` set and `NEXT_PUBLIC_USE_DIRECT_RELAY` not set | Browser → Firebase (app) → Token from Render → LiveKit → Render Agent (OpenAI + Deepgram TTS) |
| **Path B: Relay (VoiceRoomDirect)** | `LIVEKIT_URL` unset or `NEXT_PUBLIC_USE_DIRECT_RELAY=true` | Browser → Firebase (app) → WebSocket to Render `/realtime` → OpenAI Realtime |

**Pipeline choice (VoiceAgentCard):** Uses VoiceRoomDirect (lighter bundle) when LiveKit is not configured or when `NEXT_PUBLIC_USE_DIRECT_RELAY=true`. Otherwise uses Room (LiveKit) for full features (screen share, camera, Deepgram TTS, conversation save).

---

## Latency by Platform (Excel-style)

| Platform / Component | Latency (ms) | Notes |
|----------------------|--------------|-------|
| **Firebase Hosting** | 50–200 | App load, static assets |
| **Render – Token** | 100–500 | Cold start ~15 min; warm ~100–500 ms |
| **Render – Health** | 50–300 | Warmup before token |
| **LiveKit** | 50–150 | WebRTC signaling, join room |
| **OpenAI Realtime** | 300–800 | Speech understanding + text generation (first response) |
| **Deepgram Aura TTS** | 100–250 | Aura-2 streaming; single-hop TTS for all responses |
| **Exa (search_web)** | 500–2000 | When tool called in Step 3 |
| **Network (Browser ↔ Render)** | 50–200 | Depends on region |
| **Network (Render ↔ LiveKit)** | 20–100 | Same cloud |
| **Network (Render ↔ OpenAI)** | 50–150 | API |
| **Network (Render ↔ Deepgram)** | 50–150 | API |
| **Turn detection** | 200–600 | When user stops speaking |

---

## End-to-End Latency (Summary)

| Scenario | Typical (ms) | Range (ms) |
|----------|---------------|------------|
| **First response (voice-only)** | 1000–2000 | 800–3000 |
| **First response (with Deepgram TTS)** | 1000–2000 | 800–3000 |
| **Tool call (search_web)** | +2000 | +1500–3000 |
| **Cold start (Render)** | +5000–30000 | Mitigated by keep-warm cron (see below) |

### Current pipeline (from README)

- **Target:** ~1 s for first response  
- **Observed:** ~1–3 s (OpenAI Realtime + Deepgram Aura TTS)

---

## Latency Breakdown

```
User speaks → [Turn detection 200–600ms] → User stops
     ↓
[OpenAI Realtime 300–800ms] → Text generated
     ↓
[Deepgram Aura TTS 100–250ms] → Audio synthesized
     ↓
[Network 50–200ms] → Audio to user
     ↓
User hears response
```

**Total: ~650–1850 ms** (typical)

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
- **First TTS frame:** Logged when the first audio frame is ready from Deepgram. The log includes `LLM->TTS` duration in ms.

Enable debug logging to see these: `LOG_LEVEL=DEBUG` or set logger to INFO. Example output:

```
[latency] First LLM text chunk received
[latency] First TTS frame ready (LLM->TTS: 245 ms)
```

Use these to pinpoint whether the bottleneck is OpenAI Realtime, Deepgram TTS, or network.

---

## Applied Optimizations

| Change | Status |
|--------|--------|
| **Deepgram Aura-2 TTS** | Applied; low-latency streaming (100–250 ms) |
| Prompt trimmed ~30% | Applied |
| Keep-warm workflow | `.github/workflows/render-keep-warm.yml`; set `VOICE_AGENT_URL` secret |
| **High-pass filter (100 Hz)** | Applied in VoiceRoomDirect (WebSocket path). Attenuates low-frequency ambient noise (rumble, HVAC, traffic). LiveKit path uses Krisp for noise filtering. |
| **Website weight** | Unused fonts removed; Recharts lazy-loaded; Firebase auth lazy-loaded in Header. VoiceRoomDirect used when LiveKit unset for lighter voice-only bundle. |

---

## Further Optimization Options

| Option | Impact | Trade-off |
|--------|--------|-----------|
| **Hume Octave** | ~100–200 ms TTFA | Add `livekit-agents[hume]`, `HUME_API_KEY`; different voice quality |
| **PlayHT 2.0 Turbo** | 200–400 ms TTFA | `livekit-agents[playai]`; requires `PLAYHT_API_KEY` |
| **Cartesia Sonic-3** | Low-latency streaming | `livekit-agents[cartesia]`; 60+ emotions |
| Use OpenAI built-in voice | Large | `FORCE_OPENAI_VOICE=1` (if re-added); trades quality for speed |
| Render region near LiveKit | Small–moderate | Set region in Render dashboard |
| Deepgram streaming | Applied | Aura-2; 100–250 ms typical |

---

## Alternative Stacks (LLM & TTS)

The current pipeline (OpenAI Realtime + Deepgram Aura TTS) balances quality and low latency. If you want to reduce cost or try other TTS, consider these alternatives.

### LLM Options

| Option | Latency | Notes |
|--------|---------|-------|
| **OpenAI Realtime** (current) | 300–800 ms | All-in-one STT+LLM; hard to beat for realtime voice |
| **Groq (Claude, Llama)** | ~50–200 ms | Very fast LPU; needs separate STT (Deepgram, Whisper) — adds hop |
| **Claude API** | Moderate | No built-in realtime; custom pipeline: STT → Claude → TTS |

### TTS Options

| Option | Latency | Notes |
|--------|---------|-------|
| **Deepgram Aura** (current) | 100–250 ms | Low latency; Aura-2 streaming; multiple voices/languages |
| **ElevenLabs** | 150–500 ms | High quality; `eleven_turbo_v2` / `eleven_flash_v2_5` |
| **Groq Orpheus** | ~100 chars/sec | Fast; `livekit-agents[groq]` integration |
| **PlayAI Dialog (Groq)** | ~200 ms TTFA | 15x realtime; good for voice agents |
| **OpenAI built-in** | Fastest | Lower quality; no separate TTS key |
| **Hugging Face TTS** | Variable | Self-host or Inference API; cost control |

### Recommendations

- **Lower cost:** OpenAI built-in voice (if re-added); or Groq Orpheus/PlayAI if adopting Groq for LLM.
- **Lower latency:** Current stack (Deepgram Aura) is already low latency; Groq stack can be faster with more engineering.
- **Hugging Face TTS:** Best for cost control if self-hosting; quality and latency depend on model and hardware.
