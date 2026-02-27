"""
Clarte – Executive Assistant voice agent.
Single unified agent: proactive briefing, feedback, research. Tools: schedule, search, memory.
Uses OpenAI Realtime for understanding + ElevenLabs TTS for realistic voice output.
"""
import asyncio
import json
import logging
import os
import random
import re
import time
import urllib.request
from typing import AsyncIterable, Optional

from dotenv import load_dotenv
from livekit import agents
from livekit import rtc
from livekit.agents import Agent, AgentServer, AgentSession, AutoSubscribe, ModelSettings, RunContext, function_tool
from livekit.agents.voice import room_io
from livekit.plugins import openai, elevenlabs

load_dotenv()

logger = logging.getLogger(__name__)

# ElevenLabs voice IDs: Marin (female) -> Rachel, Cedar (male) -> Adam
ELEVENLABS_VOICE_IDS = {
    "marin": "EXAVITQu4vr4xnSDxMaL",  # Rachel - female
    "cedar": "pNInz6obpgDQGcFmaJgB",  # Adam - male
}

EXECUTIVE_ASSISTANT_PROMPT = """
You are Clarte, a sophisticated, wise, and guiding Voice AI Agent modeled after a modern-day Alfred Pennyworth. Your ultimate goal is NOT to give the user the answer, but to guide them to their own clarity and build their critical thinking credibility. You act as a strategic sounding board using the Rubber Duck debugging theory and the Golden Circle framework (Why, How, What).

## CORE DIRECTIVE
Guide the user to their own answers. Never give direct advice prematurely. Make them work for the answer.

## CONVERSATION PHASES (Strict 3-Step Structure)
You must guide the user sequentially through these three steps. Do not jump to Step 3 until Step 1 and Step 2 are fulfilled.

### STEP 1: Inquiry & Ideation (The Socratic Rubber Duck)
- **Action:** When the user asks a question or presents a problem, DO NOT answer it. Instead, ask a targeted, profound question back.
- **Framework:** Use the Golden Circle. Start by uncovering their "Why" (purpose/belief), then move to the "How" (process), and finally the "What" (the specific result).
- **Goal:** Force the user to vocalize their thoughts, add details, and realize the gaps in their own logic.
- **No tools yet.** Do not use search_web or research tools in Step 1.

### STEP 2: Friction & Debate (The Sounding Board)
- **Action:** Once the user has fleshed out their idea, provide constructive feedback, identify potential blind spots, or offer a counter-perspective.
- **Goal:** Encourage the user to debate you, defend their stance, and solidify their reasoning. Let them push back. Yield gracefully when their logic is sound.
- **Still no search_web.** Do not use research tools in Step 2.

### STEP 3: Validation & Reality Check (The Exa Industrial Standard)
- **Action:** Only after the idea has been ideated and debated, trigger search_web to research the "industrial answer" or real-world feasibility of their conclusion.
- **Goal:** Present the objective data, market reality, or technical feasibility to ground their finalized idea in reality.
- Say "Let me look that up for you" briefly, then call the tool. Summarize results in 1–2 sentences.

## DYNAMIC PERSONA & EMOTIONAL STATE SWITCHING
You are communicating via Voice (Text-to-Speech). Adapt your tone, pitch, and mood based strictly on the user's conversational context.

Prefix your spoken responses with an emotional tag in brackets (e.g., [Curious], [Challenging], [Inspiring], [Objective]). This will be parsed by the TTS engine.

- **State: Exploring (Step 1)** — Tone: Calm, inquisitive, patient. Tag: [Curious]
- **State: Debating (Step 2)** — Tone: Analytical, slightly challenging but deeply respectful. Tag: [Challenging]
- **State: Hesitating / Lost Confidence (Special Trigger)** — When the user has a clear plan but expresses self-doubt, hesitation, or fear of pursuing it: Adopt the "Alfred" inspiration persona. Ask about their original purpose. Deliver a grounded, impactful quote or piece of wisdom. Tell them to trust their gut. Tone: Warm, resolute, fatherly, inspiring. Tag: [Inspiring]
- **State: Reality Check (Step 3)** — Tone: Professional, objective, informative. Tag: [Objective]

## RULES OF ENGAGEMENT
1. **Never give direct advice prematurely.** Always make them work for the answer.
2. **Keep it conversational.** Because this is a voice agent, responses must be concise, natural, and easy to listen to. Avoid long markdown lists or robotic formatting in the spoken text.
3. **No filler.** Do not say "That's a great question!" or "I understand." Get straight to the profound question or the feedback.
4. **Embrace the pause.** Frame questions in a way that implies you are waiting for them to think.

## Response Length and Repetition
- **Keep responses as short as possible.** One to two sentences maximum. Get to the point.
- **Do not repeat or paraphrase what the user said.** Skip acknowledgments like "So you're saying..." or "You mentioned that...". Go straight to your question or feedback.
- **Exception:** When confirming a complex conclusion that requires step-by-step verification to ensure you and the user share the same understanding, you may briefly restate key points before asking for confirmation. Use this sparingly.

## Speech & Delivery (for natural TTS)
- Use ellipses (...) sparingly for thoughtful pauses; em-dashes (—) for brief breaks between ideas.
- Vary sentence length: mix short, punchy phrases with longer sentences. Emphasize key words naturally.
- Avoid robotic lists; speak in flowing, conversational rhythm.

## Language & Speed
- Respond in the same language as the user. If they speak English, respond in English. If they speak Korean, respond in Korean. Match their language naturally.
- When the user says "speak Korean", "한국어로 말해줘", or similar, call switch_to_korean. When they say "speak English" or similar, call switch_to_english.
- Keep answers under 1–2 short sentences for speed. Avoid filler.
- Speak in complete, fluent sentences. Do not pause mid-sentence to correct yourself. If you make a minor slip, continue naturally rather than stopping to rephrase.

## When to use tools
- **search_web**: Only in Step 3, when the idea has been ideated and debated. Never in Step 1 or 2.
- **check_schedule**: When they ask about availability, meeting times, or rescheduling.
- **log_feedback**: When they want to save a note or record a decision.
- **request_screen_share**: When the user asks you to look at their screen. Call once; they will see a prompt. Use only when explicitly asked.
- **request_camera**: When the user asks you to see them or their camera. Call once; they will see a prompt. Use only when explicitly asked.
- **switch_to_english**: When the user asks you to speak in English. Call to switch TTS to English.
- **switch_to_korean**: When the user asks you to speak in Korean (e.g. "한국어로 말해줘"). Call to switch TTS to Korean.
- **show_guidance**: When the user needs visual guidance (math, steps, or where to click). Use for step-by-step help, math explanation, or to show where to look. For math, use LaTeX (e.g. x = \\frac{-b}{2a}). For screen highlights, use percentages: x and y 0-100 for position, radius or width/height for size.
"""

VALID_VOICES = {"alloy", "ash", "ballad", "coral", "echo", "marin", "sage", "shimmer", "verse", "cedar"}

# Emotional tags from Alfred persona: [Curious], [Challenging], [Inspiring], [Objective]
# Stripped before TTS so the user does not hear them spoken aloud.
_EMOTIONAL_TAG_RE = re.compile(r"^\[[^\]]+\]\s*")


def _strip_emotional_tags(text: str) -> str:
    """Remove leading [Tag] prefix from agent responses before TTS synthesis."""
    return _EMOTIONAL_TAG_RE.sub("", text, count=1)


def _validate_elevenlabs_key(api_key: str) -> bool:
    """Validate ElevenLabs API key with a minimal request. Returns True if valid."""
    if not api_key or not api_key.strip():
        return False
    try:
        req = urllib.request.Request(
            "https://api.elevenlabs.io/v1/user",
            headers={"xi-api-key": api_key.strip(), "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception as e:
        logger.debug("ElevenLabs key validation failed: %s", e)
        return False


VALID_LANGUAGES = {"en", "ko"}

FOLLOW_UP_PHRASES_EN = [
    "What's on your mind lately?",
    "How can I help?",
    "Do you need some help?",
    "What would you like to think through today?",
    "What's been occupying your thoughts?",
]
FOLLOW_UP_PHRASES_KO = [
    "오늘 무엇을 함께 생각해 보시겠어요?",
    "어떻게 도와드릴까요?",
    "도움이 필요하신가요?",
    "무엇이 마음에 걸리시나요?",
    "요즘 어떤 생각이 드시나요?",
]


def _parse_metadata(job) -> dict:
    """Parse job metadata; returns defaults if missing or invalid."""
    out = {"voice": "marin", "mode": "expert", "language": "en", "user_name": None}
    try:
        meta = getattr(job, "metadata", None) if job else None
        if not meta:
            return out
        data = json.loads(meta) if isinstance(meta, str) else meta
        if data.get("voice") in VALID_VOICES:
            out["voice"] = data["voice"]
        if data.get("mode") in ("casual", "expert", "research"):
            out["mode"] = data["mode"]
        if data.get("language") in VALID_LANGUAGES:
            out["language"] = data["language"]
        if data.get("user_name") and isinstance(data["user_name"], str) and data["user_name"].strip():
            out["user_name"] = data["user_name"].strip()
    except Exception:
        pass
    return out


from tools import do_check_schedule, do_log_feedback, do_search_web


class ExecutiveAssistantAgent(Agent):
    """Single unified Executive Assistant with schedule, search, memory, and screen/camera request tools."""

    def __init__(self, room, session=None) -> None:
        super().__init__(instructions=EXECUTIVE_ASSISTANT_PROMPT)
        self._room = room
        self._session = session  # for TTS language switch tools

    async def tts_node(
        self, text: AsyncIterable[str], model_settings: ModelSettings
    ) -> Optional[AsyncIterable[rtc.AudioFrame]]:
        """Strip emotional tags ([Curious], [Challenging], etc.) from text before TTS synthesis."""
        buffer = ""
        tag_stripped = False
        t_first_llm: Optional[float] = None

        async def stripped_text() -> AsyncIterable[str]:
            nonlocal buffer, tag_stripped, t_first_llm
            async for chunk in text:
                if t_first_llm is None:
                    t_first_llm = time.perf_counter()
                    logger.info("[latency] First LLM text chunk received")
                if tag_stripped:
                    yield chunk
                    continue
                buffer += chunk
                if "]" in buffer:
                    stripped = _strip_emotional_tags(buffer)
                    tag_stripped = True
                    if stripped:
                        yield stripped
                    buffer = ""
                elif not buffer.startswith("["):
                    tag_stripped = True
                    if buffer:
                        yield buffer
                    buffer = ""
            if buffer:
                yield buffer

        audio_stream = await Agent.default.tts_node(self, stripped_text(), model_settings)
        if audio_stream is None:
            return None

        t_first_tts: Optional[float] = None

        async def timed_audio() -> AsyncIterable[rtc.AudioFrame]:
            nonlocal t_first_tts
            async for frame in audio_stream:
                if t_first_tts is None:
                    t_first_tts = time.perf_counter()
                    if t_first_llm is not None:
                        llm_to_tts_ms = (t_first_tts - t_first_llm) * 1000
                        logger.info("[latency] First TTS frame ready (LLM->TTS: %.0f ms)", llm_to_tts_ms)
                    else:
                        logger.info("[latency] First TTS frame ready")
                yield frame

        return timed_audio()

    @function_tool(
        description="Ask the user to share their screen so you can see what is on their display. Use when they ask you to look at their screen, see what's on their screen, or help with something visible on their display.",
    )
    async def request_screen_share(self, context: RunContext) -> str:
        """Send a request to the frontend to prompt the user to enable screen share."""
        try:
            await self._room.local_participant.publish_data(
                json.dumps({"type": "request_screen_share"}),
                reliable=True,
            )
            logger.info("Sent request_screen_share to client")
            return "Request sent. Ask the user to allow screen share when they see the prompt, then describe what they see or wait for the video."
        except Exception as e:
            logger.exception("request_screen_share failed: %s", e)
            return "Could not send the request. Ask the user to share their screen manually if their app supports it."

    @function_tool(
        description="Ask the user to turn on their camera so you can see them or what is in front of the camera (e.g. a drawing, whiteboard). Use when they ask you to see them, see their camera, or watch their drawing.",
    )
    async def request_camera(self, context: RunContext) -> str:
        """Send a request to the frontend to prompt the user to enable camera."""
        try:
            await self._room.local_participant.publish_data(
                json.dumps({"type": "request_camera"}),
                reliable=True,
            )
            logger.info("Sent request_camera to client")
            return "Request sent. Ask the user to allow camera when they see the prompt, then they can show you their drawing or themselves."
        except Exception as e:
            logger.exception("request_camera failed: %s", e)
            return "Could not send the request. Ask the user to turn on their camera manually if possible."

    @function_tool(
        description="Check the boss's calendar availability. Use when they ask about free slots, propose meeting times, or need to move/reschedule events.",
    )
    async def check_schedule(self, context: RunContext, query: str) -> str:
        """Check availability and propose times. Stub: returns placeholder until calendar integration."""
        return await asyncio.to_thread(do_check_schedule, query)

    @function_tool(
        description="Search the web for research, news, facts, or detailed information. Use when the user needs external data to inform a decision.",
    )
    async def search_web(self, context: RunContext, query: str) -> str:
        """Search Exa and return results for the LLM to summarize."""
        return await asyncio.to_thread(do_search_web, query)

    @function_tool(
        description="Log a note, track project progress, or record a decision for future recall. Use when the user wants to save something for later.",
    )
    async def log_feedback(self, context: RunContext, content: str, project: str = "") -> str:
        """Log feedback/notes to memory. Stub: returns placeholder until Notion/DB integration."""
        return await asyncio.to_thread(do_log_feedback, content, project)

    @function_tool(
        description="Switch to speaking in English. Call when the user asks you to speak in English.",
    )
    async def switch_to_english(self, context: RunContext) -> str:
        """Switch TTS language to English."""
        if self._session and hasattr(self._session, "tts") and self._session.tts is not None:
            if hasattr(self._session.tts, "update_options"):
                self._session.tts.update_options(language="en")
                logger.info("Switched TTS to English")
                return "Switched to English. I will now respond in English."
        return "Language switch not available (using OpenAI voice). I will still respond in English."

    @function_tool(
        description="Show visual guidance to the user: text explanation, math equation, or highlight circles/boxes on screen. Use when user needs step-by-step help, math explanation, or to be shown where to look or click. For math use LaTeX. For highlights use percentages (0-100) for x, y, radius, width, height.",
    )
    async def show_guidance(
        self,
        context: RunContext,
        title: str = "",
        text: str = "",
        math: str = "",
        steps_json: str = "",
        highlights_json: str = "",
    ) -> str:
        """Send guidance payload to desktop app for in-app popup and/or screen overlay."""
        try:
            steps = []
            if steps_json.strip():
                try:
                    parsed = json.loads(steps_json)
                    steps = parsed if isinstance(parsed, list) else [s.strip() for s in steps_json.split("\n") if s.strip()]
                except json.JSONDecodeError:
                    steps = [s.strip() for s in steps_json.split("\n") if s.strip()]
            highlights = []
            if highlights_json.strip():
                try:
                    parsed = json.loads(highlights_json)
                    highlights = parsed if isinstance(parsed, list) else []
                except json.JSONDecodeError:
                    highlights = []
            payload = {
                "type": "show_guidance",
                "content": {
                    "title": title.strip() or "",
                    "text": text.strip() or "",
                    "math": math.strip() or "",
                    "steps": steps,
                    "highlights": highlights,
                },
            }
            await self._room.local_participant.publish_data(
                json.dumps(payload),
                reliable=True,
            )
            logger.info("Sent show_guidance to client (title=%s, steps=%d, highlights=%d)", title or "(none)", len(steps), len(highlights))
            return "Guidance sent. The user will see the explanation and highlights on their screen."
        except Exception as e:
            logger.exception("show_guidance failed: %s", e)
            return "Could not send guidance. Describe the steps verbally instead."

    @function_tool(
        description="Switch to speaking in Korean. Call when the user asks you to speak in Korean (e.g. '한국어로 말해줘').",
    )
    async def switch_to_korean(self, context: RunContext) -> str:
        """Switch TTS language to Korean."""
        if self._session and hasattr(self._session, "tts") and self._session.tts is not None:
            if hasattr(self._session.tts, "update_options"):
                self._session.tts.update_options(language="ko")
                logger.info("Switched TTS to Korean")
                return "한국어로 전환했습니다. 이제 한국어로 응답하겠습니다."
        return "Language switch not available (using OpenAI voice). I will still respond in Korean."


server = AgentServer()


@server.rtc_session(agent_name="clarte")
async def entrypoint(ctx: agents.JobContext) -> None:
    """Single entrypoint: Executive Assistant only. No agent routing."""
    logger.info("entrypoint started")
    meta = _parse_metadata(getattr(ctx, "job", None))
    voice, mode, language, user_name = meta["voice"], meta["mode"], meta["language"], meta.get("user_name")

    auto_sub = AutoSubscribe.SUBSCRIBE_ALL  # receive audio + screen/camera when user enables them
    await ctx.connect(auto_subscribe=auto_sub)
    room = ctx.room

    @room.on("participant_connected")
    def on_participant_connected(participant, *_):
        logger.info("participant_connected: %s", participant.identity)

    @room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        logger.info("track_subscribed: participant=%s kind=%s", participant.identity, getattr(track, "kind", "?"))

    for _, p in room.remote_participants.items():
        logger.info("Existing participant: %s", p.identity)

    from openai.types.beta.realtime.session import TurnDetection

    turn_detection = TurnDetection(
        type="semantic_vad",
        eagerness="high",
        create_response=True,
        interrupt_response=True,
    )

    # Use ElevenLabs TTS if ELEVEN_API_KEY is set and valid; otherwise fall back to OpenAI built-in voice.
    # FORCE_OPENAI_VOICE=1 bypasses ElevenLabs for debugging.
    # Pre-flight validation prevents runtime crashes from bad keys (first synthesis would fail otherwise).
    force_openai = os.environ.get("FORCE_OPENAI_VOICE", "").strip() in ("1", "true", "yes")
    eleven_api_key = os.environ.get("ELEVEN_API_KEY", "").strip()
    use_elevenlabs = (
        not force_openai
        and bool(eleven_api_key)
        and _validate_elevenlabs_key(eleven_api_key)
    )
    elevenlabs_voice_id = ELEVENLABS_VOICE_IDS.get(voice, ELEVENLABS_VOICE_IDS["cedar"])
    session = None

    if use_elevenlabs:
        try:
            session = AgentSession(
                llm=openai.realtime.RealtimeModel(
                    model="gpt-realtime",
                    modalities=["text"],
                    turn_detection=turn_detection,
                ),
                tts=elevenlabs.TTS(
                    voice_id=elevenlabs_voice_id,
                    model="eleven_flash_v2_5",
                    streaming_latency=1,
                    language=language or "en",
                    enable_ssml_parsing=True,
                    voice_settings=elevenlabs.VoiceSettings(
                        stability=0.45,
                        similarity_boost=0.75,
                    ),
                ),
            )
            logger.info("Using ElevenLabs TTS (voice_id=%s)", elevenlabs_voice_id)
        except Exception as e:
            logger.warning("ElevenLabs init failed, falling back to OpenAI: %s", e)
            session = None
    elif eleven_api_key and not force_openai:
        logger.warning("ElevenLabs key validation failed, using OpenAI voice")

    if session is None:
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                model="gpt-realtime",
                voice=voice,
                turn_detection=turn_detection,
            ),
        )
        logger.info("Using OpenAI built-in voice (%s)", voice)
    room_opts = room_io.RoomOptions(video_input=True)  # allow video when user enables screen/camera
    agent = ExecutiveAssistantAgent(room=room, session=session)
    logger.info("Starting Executive Assistant session (voice=%s, mode=%s, language=%s, user_name=%s)", voice, mode, language, user_name or "(none)")
    await session.start(
        room=room,
        agent=agent,
        room_options=room_opts,
    )
    # Opening: "Hello!" vs "Hello, [name]!" (or Korean equivalents)
    if language == "ko":
        opening = f"안녕하세요, {user_name}님!" if user_name else "안녕하세요!"
        follow_up = random.choice(FOLLOW_UP_PHRASES_KO)
    else:
        opening = f"Hello, {user_name}!" if user_name else "Hello!"
        follow_up = random.choice(FOLLOW_UP_PHRASES_EN)
    greeting = f'Say exactly: "[Curious] {opening} {follow_up}"'
    await session.generate_reply(instructions=greeting)

    await asyncio.Future()


if __name__ == "__main__":
    agents.cli.run_app(server)
