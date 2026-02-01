# Clarte Voice AI: System Overview, Tuning & Adding Features

## Current system pipeline

1. **Frontend** (`components/voice/Room.tsx`): User clicks “Start voice call” → browser sends `POST` to `NEXT_PUBLIC_PIPECAT_BACKEND_URL/session`.
2. **Backend** (`backend/server.py`): Creates a Daily.co room and meeting token, starts the Pipecat bot in a background task, returns `{ room_url, token }`.
3. **Bot** (`backend/bot.py`): Builds a Pipecat pipeline and joins the Daily room:
   - **DailyTransport** – WebRTC (mic, camera, optional screen share).
   - **SileroVAD** – Voice activity detection (when the user is speaking).
   - **GeminiMultimodalLiveLLMService** – Gemini 2.0/2.5 Flash Live: speech-in, text reasoning, speech-out; can receive video frames when the user shares their screen.
   - **LLMContext** + aggregators – Turn-taking and context (user/assistant messages).
4. **Frontend** joins the same Daily room with the token; audio and (optional) screen share go to the bot. The bot replies with voice and can “see” the screen when shared.

---

## Where to feed the prompt (system instruction)

All agent personality and instructions are set in **`backend/bot.py`**.

### 1. Main system instruction (recommended)

Edit the **`system_instruction`** passed to `GeminiMultimodalLiveLLMService`:

```python
llm = GeminiMultimodalLiveLLMService(
    api_key=gemini_api_key,
    voice_id="Aoede",  # See "Voice" below
    system_instruction=(
        "You are Clarte, a helpful voice AI assistant. You can see the user's screen when they share it. "
        "Reference what you see on screen when relevant. Be concise and natural for voice conversation."
    ),
    # ...
)
```

Change the string to whatever you want: tone, role, rules, topics to avoid, etc. This is the main place to tune “what the agent says and how it behaves.”

### 2. Context system message (optional)

There is also an initial **context** message used by the aggregators:

```python
messages = [
    {
        "role": "system",
        "content": "You are Clarte. When the user shares their screen, you see it in real time. Use that context to help them. Keep responses natural for voice.",
    },
]
context = LLMContext(messages)
```

Keep this aligned with `system_instruction` or use it for extra rules; the LLM sees both.

---

## How to tune the voice AI

| What to change | Where in `backend/bot.py` | Notes |
|----------------|----------------------------|--------|
| **Personality / instructions** | `system_instruction=("...")` and/or `messages = [{"role": "system", "content": "..."}]` | Main place for “prompt”. Be concise for voice. |
| **Voice (TTS)** | `voice_id="Aoede"` | Options: `Puck`, `Charon`, `Kore`, `Fenrir`, `Aoede`. Change to any of these strings. |
| **When the user “stops” talking** | `VADParams(stop_secs=0.5)` and `SileroVADAnalyzer(params=VADParams(stop_secs=0.5))` | Increase (e.g. `0.7`) to wait longer before treating silence as end-of-turn; decrease for faster cut-off. |
| **Turn-taking / barge-in** | `UserTurnStrategies(stop=[TurnAnalyzerUserTurnStopStrategy(turn_analyzer=LocalSmartTurnAnalyzerV3())])` | Default is smart turn detection; you can swap in other Pipecat turn strategies if needed. |
| **Audio sample rates** | `DailyParams(audio_in_sample_rate=16000, audio_out_sample_rate=24000, ...)` | Usually leave as-is unless you have a reason to change. |

After any change to `backend/bot.py`, redeploy the backend (e.g. push to GitHub and let Render redeploy, or redeploy manually on Render). The frontend does not need to change for prompt/voice/tuning.

---

## Adding more features

- **New instructions or capabilities**  
  Extend the `system_instruction` (and optionally the context `messages`) in `backend/bot.py`. Example: “You are Clarte, a coding assistant. When the user shares their screen, focus on the code and suggest edits briefly.”

- **Different Gemini model or parameters**  
  In `backend/bot.py`, if `GeminiMultimodalLiveLLMService` supports parameters (e.g. `model`, `temperature`), set them in the constructor. Check the Pipecat docs for your version: [Pipecat](https://github.com/pipecat-ai/pipecat).

- **Custom pipeline steps (e.g. profanity filter, logging)**  
  Add Pipecat processors between `transport.input()` and `llm`, or between `llm` and `transport.output()`. See Pipecat docs for “Pipeline” and “Processors”.

- **Reacting to call events**  
  Use `@transport.event_handler("on_first_participant_joined")`, `on_participant_joined`, `on_participant_left` (already in `bot.py`). You can add more handlers or logic (e.g. send a first message, log, or adjust context).

- **Sending structured data or tools to the LLM**  
  If your Pipecat/Gemini integration supports tools or function-calling, add them in `backend/bot.py` according to Pipecat’s Gemini Multimodal Live API.

---

## Quick reference

| File | Purpose |
|------|--------|
| `backend/bot.py` | **Prompt** (`system_instruction` + context `messages`), **voice** (`voice_id`), **VAD/turn** params, **pipeline** and **event handlers**. |
| `backend/server.py` | Creates Daily room and token, starts the bot; no prompt or voice config. |
| `components/voice/Room.tsx` | Frontend: calls `/session`, joins Daily, screen share; no prompt or voice config. |

To change what the agent says and how it sounds: edit **`backend/bot.py`**, then redeploy the backend.
