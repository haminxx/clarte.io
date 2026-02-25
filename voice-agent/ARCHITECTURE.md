# Executive Assistant Architecture

Single unified voice agent (Jarvis-style) — no multi-agent routing, no frontend selector.

## Persona & Interaction Loop

1. **Proactive Briefing**: Starts by asking for attention on priorities; summarizes what needs to be done today.
2. **Feedback & Strategy**: Gives pushback on plans — identifies missing steps, flaws, and improvements.
3. **Research & Sourcing**: Presents research with sources before decisions: "Here is what I found regarding X, and based on these sources, here are your options."

## Core Tools

| Tool | Purpose | Status |
|------|---------|--------|
| `check_schedule` | Check availability, propose times, move events | Stub (TODO: Google Calendar) |
| `search_web` | Web search via Exa for research | Implemented |
| `log_feedback` | Log notes, track projects, recall decisions | Stub (TODO: Notion) |

## Flow

```
User → VoiceCard "Connect to Assistant" → Room (voice-only) → Token API → LiveKit
                                                                    ↓
                                                         Agent dispatch: clarte
                                                                    ↓
                                                    ExecutiveAssistantAgent
                                                    (single entrypoint)
```

## Files

- `agent.py`: Single `@server.rtc_session(agent_name="clarte")` entrypoint; `ExecutiveAssistantAgent` with tools.
- `token_server.py`: Token + metadata `{voice, mode}` (no tier).
- `components/voice-card.tsx`: Single "Connect to Assistant" button.
- `components/voice/Room.tsx`: Connects with `mode` only (default `voice-only`).

## Future Integrations

- **Calendar**: Google Calendar API for `check_schedule`.
- **Memory**: Notion API or similar for `log_feedback`.
