# Clarte Voice – LiveKit + Speech-First Agent

Voice uses a **speech-first** pipeline: LiveKit (WebRTC) + Python agent (OpenAI Realtime, local DB, Exa research).

## Architecture

- **User** → voice (+ optional screen) → **LiveKit** → **Python agent** (this repo: `voice-agent/`).
- Agent: **OpenAI Realtime** for low-latency speech; **local vector DB** (Qdrant) for fast path; **Exa** for research when local DB returns "Unknown".
- Frontend gets a **token** from the voice-agent token server, then connects to LiveKit.

## 1. Voice agent (Python)

### Setup

```bash
cd voice-agent
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set:

- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` — from [LiveKit Cloud](https://cloud.livekit.io)
- `OPENAI_API_KEY` — OpenAI (Realtime API)
- `EXA_API_KEY` — [Exa](https://exa.ai) for research path

### Run

**Terminal 1 – agent (joins rooms):**

```bash
uv run agent.py dev
# or: python agent.py dev
```

**Terminal 2 – token server (for frontend):**

```bash
uvicorn token_server:app --host 0.0.0.0 --port 8080
```

Deploy the token server (e.g. Render, Fly) and set its URL as `NEXT_PUBLIC_VOICE_AGENT_URL` in the frontend.

## 2. Frontend (Next.js)

In project root `.env.local`:

- `NEXT_PUBLIC_LIVEKIT_URL` — same LiveKit URL (e.g. `wss://your-project.livekit.cloud`)
- `NEXT_PUBLIC_VOICE_AGENT_URL` — base URL of the token server (e.g. `https://your-voice-agent.onrender.com`)

Then `npm run build` and deploy. "Start voice call" will request a token from the voice-agent and connect to LiveKit; the agent will join the room automatically when running.

## 3. Cost / credits

- **OpenAI Realtime**: Video is expensive; the agent samples video every 2s to reduce cost. Use interruption handling so the model stops when the user talks.
- **Exa**: Use fast search; only call when local DB returns "Unknown" to preserve credits.

## 4. Folder structure (voice-agent)

```
voice-agent/
├── agent.py           # LiveKit agent: OpenAI Realtime + tools
├── db.py              # Local vector DB (Qdrant)
├── tools_exa.py       # Exa research
├── token_server.py    # FastAPI token endpoint
├── requirements.txt
├── .env.example
└── assets/
    └── knowledge_base.json   # Fast-path data
```
