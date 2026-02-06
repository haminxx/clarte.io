# Voice AI Workflow & Improvements

How this project aligns with **OpenAI Realtime** and **Voice Agents** docs, the current workflow, and what was improved.

---

## 1. Mapping to the Official Docs

### [OpenAI Realtime – Realtime conversations](https://platform.openai.com/docs/guides/realtime-conversations)

| Realtime API concept | Your project (Python + LiveKit) |
|----------------------|---------------------------------|
| **Session** | `RealtimeSession` created by LiveKit plugin when `AgentSession` starts with `RealtimeModel`. |
| **session.update** (instructions) | Done by LiveKit’s `AgentActivity._start_session()`: `await self._rt_session.update_instructions(self._agent.instructions)`. Your `Assistant(Agent)` instructions are sent as the system prompt. |
| **response.create** | Your `session.generate_reply(instructions="Greet the user...")` triggers a response with optional extra instructions. |
| **Audio in/out** | LiveKit room audio ↔ agent; plugin forwards audio to/from OpenAI Realtime over WebRTC/WebSocket. |
| **VAD (turn detection)** | Realtime model’s server-side VAD when enabled; no extra client config. |
| **Tools / function calling** | Your `@function_tool()` methods (`research_topic`, `identify_industry_local`) are sent via session tools and executed by the agent. |

### [Voice Agents Quickstart (JS)](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)

That quickstart is **JavaScript/TypeScript** (browser ↔ OpenAI with ephemeral key). Your stack is **Python server-side** with **LiveKit** in the middle:

| JS Quickstart | Your Python + LiveKit stack |
|---------------|-----------------------------|
| **RealtimeAgent** (name, instructions) | `Assistant(Agent)` with `super().__init__(instructions=...)`. |
| **RealtimeSession(agent, { model })** | `AgentSession(llm=RealtimeModel(...))` + `session.start(room=..., agent=Assistant())`. The “session” is the LiveKit room session; the Realtime session is created inside the plugin. |
| **session.connect({ apiKey: 'ek_...' })** | Frontend gets a **LiveKit JWT** from your token server, then connects to **LiveKit**. The **agent** (running in Python) connects to the same room and uses **OpenAI Realtime** (API key on server). So: browser ↔ LiveKit ↔ your agent ↔ OpenAI Realtime. |
| Ephemeral client key | You use **LiveKit tokens** for auth; the **OpenAI API key** stays on the server (agent + token server env). |

So: same **Realtime API** and **session/instructions/response** ideas; different **transport** (LiveKit + server-side agent instead of direct browser ↔ OpenAI).

---

## 2. Current Workflow (Step by Step)

```
┌─────────────────┐     GET /token      ┌──────────────────┐
│  Next.js        │ ──────────────────► │  Token server    │
│  (Room.tsx)     │ ◄────────────────── │  (FastAPI)       │
│                 │   { token, room }   │  LiveKit JWT     │
└────────┬────────┘                     └──────────────────┘
         │
         │ connect with token
         ▼
┌─────────────────┐                     ┌──────────────────┐
│  LiveKit Cloud  │ ◄────────────────►│  Voice agent     │
│  (room)         │   audio + control   │  (Python)        │
└────────┬────────┘                     │  - AgentSession  │
         │                              │  - RealtimeModel │
         │                              │  - Assistant()   │
         │                              └────────┬─────────┘
         │                                       │
         │                                       │ session.update /
         │                                       │ response.create
         │                                       ▼
         │                              ┌──────────────────┐
         │                              │  OpenAI Realtime  │
         │                              │  (gpt-realtime)   │
         │                              └──────────────────┘
         │
         │  user mic → room → agent → Realtime → agent → room → user speaker
         ▼
    User hears agent; agent hears user; tools (Exa, local DB) run on agent.
```

1. **Frontend**  
   User clicks “Start voice call” → `Room.tsx` calls `VOICE_AGENT_URL/token` → gets `{ token, room }` (LiveKit JWT).

2. **Connect**  
   `LiveKitRoom` connects to `LIVEKIT_URL` with `token`; mic is used for audio, `RoomAudioRenderer` plays remote audio.

3. **Agent join**  
   When a participant joins, LiveKit dispatches to your agent. `entrypoint()` runs:  
   `ctx.connect(SUBSCRIBE_ALL)` → `session = _create_session(ctx)` → `session.start(room=ctx.room, agent=Assistant(), room_options=...)`.

4. **Realtime session & instructions**  
   Inside `session.start()`, LiveKit’s `AgentActivity._start_session()`:
   - Creates `RealtimeSession` from `RealtimeModel`.
   - Sends **session.update** with **instructions**: `await self._rt_session.update_instructions(self._agent.instructions)` (your `Assistant` instructions = system prompt).

5. **Greeting**  
   After `session.start()` we do **not** block on the greeting. We run:
   - `asyncio.create_task(session.generate_reply(instructions="Greet the user and offer your assistance."))`
   So the entrypoint returns and the room’s audio pipeline and the first reply run in parallel.

6. **Ongoing voice**  
   User speaks → LiveKit → agent → Realtime (input audio + VAD) → model replies → Realtime → agent → LiveKit → user.  
   Tools (`research_topic`, `identify_industry_local`) are invoked by the model and run in the agent process.

---

## 3. Improvements Made (Structure & Realtime Alignment)

| Area | Before / issue | Change |
|------|----------------|--------|
| **Instructions** | RealtimeModel was given `instructions=` in Python, which it doesn’t support → crash. | Removed `instructions` from `RealtimeModel()`. System prompt comes only from **Agent**: `Assistant(Agent)` with `super().__init__(instructions=...)`. The framework sends these via **session.update** in `_start_session()`. |
| **Greeting / blocking** | `await session.generate_reply(...)` kept the entrypoint blocked until the first reply finished, which could starve the room’s audio pipeline. | Greeting is started with **`asyncio.create_task(session.generate_reply(...))`** so the entrypoint returns immediately and audio I/O and the first response run together. |
| **Realtime semantics** | — | Confirmed: **session.update** = system instructions (done by framework); **response.create** = trigger reply (your `generate_reply`). No extra client-side instruction send in your code. |
| **Token server** | `HTTPException` was used but not imported. | Added `HTTPException` to the FastAPI import in `token_server.py`. |

---

## 4. Summary

- **OpenAI Realtime**: Your app uses the same **session lifecycle** (session.update for instructions, response.create for replies) and **audio/tools** model; the Realtime API is used by the **LiveKit OpenAI plugin** on the server.
- **Voice Agents (JS) quickstart**: Same **agent + session + instructions** idea; your “session” is the LiveKit room plus the plugin’s Realtime session; auth is LiveKit JWT instead of an ephemeral OpenAI key in the browser.
- **Current workflow**: Frontend gets LiveKit token → joins room → agent joins same room → Realtime session created and instructions set → greeting fired in background → continuous voice + tools.
- **Improvements**: Instructions only on Agent (not on RealtimeModel), non-blocking greeting via `create_task`, and a small token-server import fix.

For more detail on the Realtime API: [Realtime conversations](https://platform.openai.com/docs/guides/realtime-conversations).  
For the JS voice quickstart (conceptual parallel): [Voice Agents Quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/).
