# Clarte Voice Agent (Speech-First)

LiveKit agent: OpenAI Realtime + local Qdrant DB (fast path) + Exa (research path). See project root **docs/VOICE_AGENT_SETUP.md** for full setup.

## Quick run

```bash
pip install -r requirements.txt
# Set .env (copy from .env.example): LIVEKIT_*, OPENAI_API_KEY, EXA_API_KEY

# Terminal 1: agent
python agent.py dev

# Terminal 2: token server (for frontend)
uvicorn token_server:app --host 0.0.0.0 --port 8080
```

Frontend needs `NEXT_PUBLIC_LIVEKIT_URL` and `NEXT_PUBLIC_VOICE_AGENT_URL` (token server base URL).
