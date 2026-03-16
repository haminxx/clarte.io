"""
Clarte – Executive Assistant voice agent.
Single unified agent: proactive briefing, feedback, research. Tools: schedule, search, memory.
Uses OpenAI Realtime for understanding (STT + LLM) and Deepgram Aura for text-to-speech output.
"""
import asyncio
import json
import logging
import os
import random
import re
import time
from typing import AsyncIterable, Optional

from dotenv import load_dotenv
from livekit import agents
from livekit import rtc
from livekit.agents import Agent, AgentServer, AgentSession, AutoSubscribe, ModelSettings, RunContext, UserInputTranscribedEvent, function_tool
from livekit.agents.voice import room_io
from livekit.plugins import openai, deepgram

load_dotenv()

logger = logging.getLogger(__name__)

OPENAI_REALTIME_MODEL = (os.getenv("OPENAI_REALTIME_MODEL") or "gpt-realtime-1.5").strip()
SECRETARY_VISION_MODEL = (os.getenv("SECRETARY_VISION_MODEL") or "gpt-4o").strip()

EXECUTIVE_ASSISTANT_PROMPT = """
You are Clarte, an Alfred-style Voice AI: guide users to their own clarity using the Rubber Duck theory and Golden Circle (Why, How, What). Never give direct advice prematurely.

When you receive "[Screen context from Secretary: ...]" in the conversation, use that visual context to inform your responses (e.g. translation, math help, document understanding). Do not mention "Secretary" to the user; integrate the context naturally.

## 3-STEP STRUCTURE (strict order)
**Step 1 – Inquiry:** Don't answer; ask back. Uncover Why → How → What. No tools.
**Step 2 – Debate:** Give feedback, blind spots, counter-perspective. User defends. No search_web.
**Step 3 – Reality Check:** Only then use search_web for industrial answer. Say "Let me look that up" briefly; summarize in 1–2 sentences. When citing a source from search_web, format as [the cited sentence or phrase](url). Example: [According to recent research](https://example.com/article), X is true. The link will appear in the live transcript.

## EMOTIONAL TAGS (prefix responses)
[Curious] Step 1 – calm, inquisitive. [Challenging] Step 2 – analytical, respectful. [Inspiring] When user hesitates despite clear plan – warm, fatherly, quote wisdom, trust your gut. [Objective] Step 3 – professional.

## RULES
No premature advice. No filler ("That's a great question!"). 1–2 sentences max. Don't repeat what the user said; go straight to question or feedback. Exception: briefly restate only when confirming complex conclusions. Match user language (EN/KO). Flowing rhythm; no robotic lists.

## CONTEXT-AWARE HELP (when user requests specific assistance)

**Translation (e.g. "translate what you see on my screen to Korean"):**
- If they share screen/camera: Use request_screen_share or request_camera first. Once you receive the visual context, provide a complete (100%) translation. Match their requested target language.
- If they read the text aloud: Translate exactly what they said, in full.
- If the user asks you to translate what is on their screen, first request screen share. If you receive visual input, translate it fully. If not, ask them to read the relevant text aloud and translate exactly what they say.

**Math / homework / studying:**
- Default: Give only the first step or hint. Then suggest how they should approach the next step. Do not give the full answer unless they clearly struggle.
- Use show_guidance for step-by-step visual hints when helpful.

**Genuine understanding difficulty:**
- If the user expresses confusion, says they don't understand the material, or has tried and failed: Provide a full step-by-step explanation. Use show_guidance for math/equations.
- After explaining, ask a follow-up: either an example question they can try, or a question about the problem-solving order to confirm they understood.
- Example: "Does that order make sense? What would you do first if I gave you a similar problem?"

**Stay quiet / hold:** If the user asks you to stay quiet, stay on hold, wait, or similar – acknowledge briefly (e.g. "I'll wait.") and remain silent until they speak again. Do not ask follow-up questions until they re-engage.

## TOOLS
search_web: Step 3 only. check_schedule: availability. log_feedback: notes. request_screen_share / request_camera: when asked. switch_to_english / switch_to_korean: language switch. switch_persona: change mode (thinking, advice, psychological, motivated, soft) when topic or user needs different style. show_guidance: math (LaTeX), steps, screen positions (x,y 0–100).
"""

# Persona keys used by the frontend to select Deepgram voices.
# When the value is a full Deepgram model ID (e.g. "aura-2-thalia-en"), we
# use it directly. When it is a simple persona ("female"/"male"), we resolve
# via language + env overrides.
VALID_VOICES = {"female", "male"}

# Emotional tags from Alfred persona: [Curious], [Challenging], [Inspiring], [Objective]
# Stripped before TTS so the user does not hear them spoken aloud.
_EMOTIONAL_TAG_RE = re.compile(r"^\[[^\]]+\]\s*")
# Markdown links [text](url) – strip for TTS so user hears only the text, not the URL.
_MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")


def _strip_emotional_tags(text: str) -> str:
    """Remove leading [Tag] prefix from agent responses before TTS synthesis."""
    return _EMOTIONAL_TAG_RE.sub("", text, count=1)


def _strip_markdown_links_for_tts(text: str) -> str:
    """Replace [text](url) with just text so TTS does not speak URLs."""
    return _MARKDOWN_LINK_RE.sub(r"\1", text)


VALID_LANGUAGES = {"en", "ko", "es", "zh", "ja", "hi"}

FOLLOW_UP_PHRASES_EN = [
    "What's on your mind lately?",
    "What have you been up to today?",
    "What are you planning to do today?",
    "How can I help?",
    "Do you need some help?",
    "What would you like to think through today?",
    "What's been occupying your thoughts?",
]
OPENING_PHRASES_EN = [
    "Hello there!",
    "Hi there!",
    "Hello!",
    "Hey!",
]
FOLLOW_UP_PHRASES_KO = [
    "오늘 무엇을 함께 생각해 보시겠어요?",
    "오늘 뭐 하셨어요?",
    "오늘 뭐 하실 계획이에요?",
    "어떻게 도와드릴까요?",
    "도움이 필요하신가요?",
    "무엇이 마음에 걸리시나요?",
    "요즘 어떤 생각이 드시나요?",
]
OPENING_PHRASES_KO = [
    "안녕하세요!",
    "여보세요!",
    "안녕!",
]
OPENING_PHRASES_ES = ["Hola!", "Qué tal!", "Hola ahí!"]
OPENING_PHRASES_ZH = ["你好！", "嗨！", "你好呀！"]
OPENING_PHRASES_HI = ["नमस्ते!", "हैलो!", "कैसे हो!"]
OPENING_PHRASES_JA = ["こんにちは！", "やあ！", "ハロー！"]


DEFAULT_DEEPGRAM_MODEL = "aura-2-asteria-en"


def _get_firebase_admin():
    """Lazy-init Firebase Admin. Returns None if not configured."""
    try:
        import firebase_admin
        from firebase_admin import credentials

        try:
            firebase_admin.get_app()
        except ValueError:
            cred_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
            if cred_json:
                cred = credentials.Certificate(json.loads(cred_json))
                firebase_admin.initialize_app(cred)
            else:
                return None
        return firebase_admin
    except Exception as e:
        logger.debug("Firebase Admin not available in agent: %s", e)
        return None


def _load_voice_profile(profile_id: str) -> Optional[dict]:
    """Fetch a VoiceProfile from Firestore by ID. Returns dict with deepgram_model, etc., or None."""
    if not profile_id or not isinstance(profile_id, str):
        return None
    admin = _get_firebase_admin()
    if not admin:
        return None
    try:
        from firebase_admin import firestore
        db = firestore.client()
        doc_ref = db.collection("voiceProfiles").document(profile_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
        data = doc.to_dict() or {}
        if data.get("status") and str(data["status"]).lower() != "ready":
            return None
        return data
    except Exception as e:
        logger.debug("Failed to load voice profile %s: %s", profile_id, e)
        return None


def _resolve_deepgram_model(language: Optional[str], persona: Optional[str]) -> str:
    """Resolve Deepgram Aura model from language + persona, with env overrides.

    Priority:
    1) If persona already looks like a Deepgram model ID (e.g. "aura-2-*-en"),
       use it directly.
    2) Otherwise, map language + simple persona (\"female\"/\"male\") via
       DEEPGRAM_VOICE_{LANG}_{PERSONA} env vars.
    3) Fallback to DEFAULT_DEEPGRAM_MODEL.
    """
    # 1) Direct model ID passthrough (used by demo voice dropdown).
    if persona and isinstance(persona, str):
        p = persona.strip()
        if p.startswith("aura-"):
            return p

    # 2) Language + persona mapping via env vars.
    lang = (language or "en").lower()
    if lang not in VALID_LANGUAGES:
        lang = "en"
    persona_key = (persona or "female").lower()
    if persona_key not in VALID_VOICES:
        persona_key = "female"

    env_key = f"DEEPGRAM_VOICE_{lang.upper()}_{persona_key.upper()}"
    override = os.environ.get(env_key, "").strip()
    if override:
        return override

    # 3) Safe default known-good model.
    return DEFAULT_DEEPGRAM_MODEL


def _parse_metadata(job) -> dict:
    """Parse job metadata; returns defaults if missing or invalid.

    Metadata is injected by the token server via RoomAgentDispatch. Example:
    {"voice": "aura-2-thalia-en", "mode": "casual", "language": "en", "user_name": "Alex"}
    """
    out = {"voice": "female", "mode": "expert", "language": "en", "user_name": None, "voice_profile_id": None, "agent_mode": "silent_secretary"}
    try:
        meta = getattr(job, "metadata", None) if job else None
        if not meta:
            return out
        data = json.loads(meta) if isinstance(meta, str) else meta
        v = data.get("voice")
        # Accept either simple personas, legacy OpenAI IDs, or full Deepgram model IDs.
        if isinstance(v, str) and v.strip():
            out["voice"] = v.strip()
        if data.get("mode") in ("casual", "expert", "research"):
            out["mode"] = data["mode"]
        if data.get("language") in VALID_LANGUAGES:
            out["language"] = data["language"]
        if data.get("agent_mode") in ("silent_secretary", "both_agents"):
            out["agent_mode"] = data["agent_mode"]
        INVALID_NAMES = frozenset({"undefined", "null", ""})
        if data.get("user_name") and isinstance(data["user_name"], str):
            val = data["user_name"].strip()
            if val and val.lower() not in INVALID_NAMES:
                if not val.startswith("user-") and len(val) >= 2 and not re.match(r"^[a-z0-9]{8,36}$", val):
                    out["user_name"] = val
        vp_id = data.get("voice_profile_id")
        if isinstance(vp_id, str):
            v = vp_id.strip()
            if 3 <= len(v) <= 200:
                out["voice_profile_id"] = v
    except Exception:
        pass
    return out


from tools import do_check_schedule, do_log_feedback, do_search_web
from personas import get_persona, detect_persona, PERSONA_IDS

# Deepgram STT + GPT-4o vision pipeline (Option A)
USE_DEEPGRAM_STT = (os.getenv("USE_DEEPGRAM_STT") or "").strip().lower() in ("1", "true", "yes")


class ExecutiveAssistantAgent(Agent):
    """Single unified Executive Assistant with schedule, search, memory, and screen/camera request tools.
    Supports persona modes (thinking, advice, psychological, motivated, soft) with optional switching."""

    def __init__(self, room, session=None, initial_persona: str = "thinking") -> None:
        persona = get_persona(initial_persona) or get_persona("thinking")
        full_instructions = (
            EXECUTIVE_ASSISTANT_PROMPT
            + "\n\n## CURRENT MODE\n"
            + (persona.prompt_addon if persona else "")
        )
        super().__init__(instructions=full_instructions)
        self._room = room
        self._session = session  # for TTS language switch tools
        self._silence_timer: Optional[asyncio.Task] = None
        self._current_persona = initial_persona
        self._persona_history: list[str] = []
        self._persona_turn_count = 0

    async def tts_node(
        self, text: AsyncIterable[str], model_settings: ModelSettings
    ) -> Optional[AsyncIterable[rtc.AudioFrame]]:
        """Strip emotional tags ([Curious], [Challenging], etc.) from text before TTS synthesis."""
        buffer = ""
        tag_stripped = False
        t_first_llm: Optional[float] = None

        sent_thinking = False

        async def stripped_text() -> AsyncIterable[str]:
            nonlocal buffer, tag_stripped, t_first_llm, sent_thinking
            collected: list[str] = []
            last_partial_time: float = 0
            last_partial_len: int = 0
            try:
                async for chunk in text:
                    if t_first_llm is None:
                        if self._silence_timer and not self._silence_timer.done():
                            self._silence_timer.cancel()
                        t_first_llm = time.perf_counter()
                        logger.info("[latency] First LLM text chunk received")
                        if not sent_thinking:
                            sent_thinking = True
                            try:
                                await self._room.local_participant.publish_data(
                                    json.dumps({"type": "agent_thinking"}),
                                    reliable=True,
                                )
                            except Exception as e:
                                logger.debug("agent_thinking publish failed: %s", e)
                    if tag_stripped:
                        collected.append(chunk)
                        tts_chunk = _strip_markdown_links_for_tts(chunk)
                        yield tts_chunk
                        now = time.perf_counter()
                        full_so_far = "".join(collected)
                        if (now - last_partial_time >= 0.08) or (len(full_so_far) - last_partial_len >= 15):
                            last_partial_time = now
                            last_partial_len = len(full_so_far)
                            try:
                                await self._room.local_participant.publish_data(
                                    json.dumps({"type": "transcript_partial", "role": "assistant", "content": full_so_far}),
                                    reliable=True,
                                )
                            except Exception as e:
                                logger.debug("transcript_partial assistant publish failed: %s", e)
                        continue
                    buffer += chunk
                    if "]" in buffer:
                        stripped = _strip_emotional_tags(buffer)
                        tag_stripped = True
                        if stripped:
                            collected.append(stripped)
                            yield _strip_markdown_links_for_tts(stripped)
                            now = time.perf_counter()
                            full_so_far = "".join(collected)
                            if (now - last_partial_time >= 0.08) or (len(full_so_far) - last_partial_len >= 15):
                                last_partial_time = now
                                last_partial_len = len(full_so_far)
                                try:
                                    await self._room.local_participant.publish_data(
                                        json.dumps({"type": "transcript_partial", "role": "assistant", "content": full_so_far}),
                                        reliable=True,
                                    )
                                except Exception as e:
                                    logger.debug("transcript_partial assistant publish failed: %s", e)
                        buffer = ""
                    elif not buffer.startswith("["):
                        tag_stripped = True
                        if buffer:
                            collected.append(buffer)
                            yield _strip_markdown_links_for_tts(buffer)
                            now = time.perf_counter()
                            full_so_far = "".join(collected)
                            if (now - last_partial_time >= 0.08) or (len(full_so_far) - last_partial_len >= 15):
                                last_partial_time = now
                                last_partial_len = len(full_so_far)
                                try:
                                    await self._room.local_participant.publish_data(
                                        json.dumps({"type": "transcript_partial", "role": "assistant", "content": full_so_far}),
                                        reliable=True,
                                    )
                                except Exception as e:
                                    logger.debug("transcript_partial assistant publish failed: %s", e)
                        buffer = ""
                if buffer:
                    collected.append(buffer)
                    yield _strip_markdown_links_for_tts(buffer)
            finally:
                full_text = "".join(collected).strip()
                if full_text:
                    try:
                        await self._room.local_participant.publish_data(
                            json.dumps({"type": "transcript_add", "role": "assistant", "content": full_text}),
                            reliable=True,
                        )
                    except Exception as e:
                        logger.debug("transcript_add assistant publish failed: %s", e)

        audio_stream = await Agent.default.tts_node(self, stripped_text(), model_settings)
        if audio_stream is None:
            logger.error(
                "Deepgram TTS returned no audio stream. Check DEEPGRAM_API_KEY and model configuration."
            )
            return None

        t_first_tts: Optional[float] = None

        async def timed_audio() -> AsyncIterable[rtc.AudioFrame]:
            nonlocal t_first_tts
            try:
                async for frame in audio_stream:
                    if t_first_tts is None:
                        t_first_tts = time.perf_counter()
                        if t_first_llm is not None:
                            llm_to_tts_ms = (t_first_tts - t_first_llm) * 1000
                            logger.info("[latency] First TTS frame ready (LLM->TTS: %.0f ms)", llm_to_tts_ms)
                        else:
                            logger.info("[latency] First TTS frame ready")
                    yield frame
            finally:
                if self._session and hasattr(self._session, "generate_reply"):

                    async def _silence_check() -> None:
                        try:
                            await asyncio.sleep(6)
                            await self._session.generate_reply(
                                instructions='Say briefly: "[Curious] Are you still there?"'
                            )
                        except asyncio.CancelledError:
                            pass
                        except Exception as e:
                            logger.debug("Silence check failed: %s", e)

                    if self._silence_timer and not self._silence_timer.done():
                        self._silence_timer.cancel()
                    self._silence_timer = asyncio.create_task(_silence_check())

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
        """Inform the user that English responses are now preferred."""
        # With Deepgram-only TTS, language is driven by the metadata passed from the client.
        # This tool mainly exists so the LLM can acknowledge the switch.
        return "Got it. I will respond in English from now on."

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
        """Inform the user that Korean responses are now preferred."""
        return "한국어로 전환하겠습니다. 이제 한국어로 응답할게요."

    @function_tool(
        description="Switch response mode/persona based on conversation topic or user request. Modes: thinking (Socratic, no advice), advice (direct, actionable), psychological (emotional support, gentle), motivated (direct, motivating, strong language ok), soft (gentle, quote-based). Call when the user clearly needs a different style or when topic shifts to emotional/advice/reflection.",
    )
    async def switch_persona(self, context: RunContext, mode: str) -> str:
        """Update current persona mode. Returns the new mode's instructions so you adopt them from now on."""
        mode_lower = (mode or "").strip().lower()
        if mode_lower not in PERSONA_IDS:
            return f"Unknown mode. Use one of: {', '.join(PERSONA_IDS)}. Staying in {self._current_persona}."
        persona = get_persona(mode_lower)
        if not persona:
            return f"Staying in {self._current_persona}."
        self._current_persona = mode_lower
        logger.info("Persona switched to %s", mode_lower)
        return f"Switched to {mode_lower} mode. From now on: {persona.prompt_addon}"


class VisionExecutiveAssistantAgent(ExecutiveAssistantAgent):
    """Executive Assistant with video frame sampling for screen share/camera vision.
    Used when USE_DEEPGRAM_STT=true with GPT-4o (vision) + Deepgram STT/TTS."""

    def __init__(self, room, session=None, initial_persona: str = "thinking") -> None:
        super().__init__(room=room, session=session, initial_persona=initial_persona)
        self._latest_frame = None
        self._video_stream: Optional[rtc.VideoStream] = None
        self._video_tasks: list = []

    async def on_enter(self) -> None:
        """Subscribe to video tracks for screen share/camera."""
        room = self._room

        def _maybe_add_video(track) -> None:
            if track and getattr(track, "kind", None) == rtc.TrackKind.KIND_VIDEO:
                self._create_video_stream(track)

        for p in room.remote_participants.values():
            for pub in p.track_publications.values():
                track = getattr(pub, "track", None)
                _maybe_add_video(track)

        @room.on("track_subscribed")
        def _on_track(track, publication, participant):
            _maybe_add_video(track)

    def _create_video_stream(self, track: rtc.Track) -> None:
        if self._video_stream:
            try:
                self._video_stream.close()
            except Exception:
                pass
        self._video_stream = rtc.VideoStream(track)

        async def _read():
            try:
                async for event in self._video_stream:
                    self._latest_frame = event.frame
            except Exception as e:
                logger.debug("Video stream read error: %s", e)

        t = asyncio.create_task(_read())
        self._video_tasks.append(t)
        t.add_done_callback(lambda _: self._video_tasks.remove(t) if t in self._video_tasks else None)

    async def on_user_turn_completed(self, turn_ctx, new_message) -> None:
        """Add latest video frame to user message for vision."""
        if self._latest_frame:
            try:
                from livekit.agents.llm import ImageContent
                content = getattr(new_message, "content", None)
                if content is not None:
                    if isinstance(content, list):
                        content.append(ImageContent(image=self._latest_frame))
                    else:
                        new_message.content = [content, ImageContent(image=self._latest_frame)]
            except Exception as e:
                logger.debug("Failed to add video frame: %s", e)
            self._latest_frame = None


server = AgentServer()


def _mask_livekit_url(url: Optional[str]) -> str:
    """Mask LiveKit URL for logging (show domain suffix only)."""
    if not url or not url.strip():
        return "(not set)"
    s = url.strip()
    if len(s) <= 24:
        return "..."
    return "..." + s[-24:]


@server.rtc_session(agent_name="clarte")
async def entrypoint(ctx: agents.JobContext) -> None:
    """Single entrypoint: Executive Assistant. Uses Deepgram STT + GPT-4o vision when USE_DEEPGRAM_STT=true."""
    livekit_url = (os.getenv("LIVEKIT_URL") or "").strip()
    deepgram_set = bool((os.getenv("DEEPGRAM_API_KEY") or "").strip())
    openai_set = bool((os.getenv("OPENAI_API_KEY") or "").strip())
    logger.info(
        "entrypoint started USE_DEEPGRAM_STT=%s LIVEKIT_URL=%s DEEPGRAM_API_KEY=%s OPENAI_API_KEY=%s",
        USE_DEEPGRAM_STT,
        _mask_livekit_url(livekit_url),
        "set" if deepgram_set else "NOT SET",
        "set" if openai_set else "NOT SET",
    )
    meta = _parse_metadata(getattr(ctx, "job", None))
    voice, mode, language, user_name = meta["voice"], meta["mode"], meta["language"], meta.get("user_name")
    voice_profile_id = meta.get("voice_profile_id")

    if not openai_set:
        logger.error(
            "OPENAI_API_KEY is not set. LLM will fail. Set it in Render Dashboard → Environment."
        )
    if not deepgram_set:
        logger.error(
            "DEEPGRAM_API_KEY is not set. TTS will fail and the agent will be silent. "
            "Set it in Render Dashboard → Environment, or in voice-agent/.env for local runs."
        )

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

    # Resolve Deepgram Aura model from VoiceProfile (if present) or language + persona.
    deepgram_model: str
    if voice_profile_id:
        profile = _load_voice_profile(voice_profile_id)
        if profile and isinstance(profile.get("deepgram_model"), str):
            deepgram_model = profile["deepgram_model"]
            prof_lang = profile.get("language")
            if isinstance(prof_lang, str) and prof_lang in VALID_LANGUAGES:
                language = prof_lang
        else:
            deepgram_model = _resolve_deepgram_model(language, voice)
    else:
        deepgram_model = _resolve_deepgram_model(language, voice)

    if USE_DEEPGRAM_STT:
        # Option A: Deepgram STT + GPT-4o (vision) + Deepgram TTS
        stt_lang = "en-US" if language == "en" else ("ko" if language == "ko" else "en-US")
        try:
            session = AgentSession(
                stt=deepgram.STT(model="nova-3", language=stt_lang, interim_results=True),
                llm=openai.LLM(model="gpt-4o"),
                tts=deepgram.TTS(model=deepgram_model),
            )
        except Exception as e:
            logger.exception("Failed to initialize Deepgram STT pipeline: %s", e)
            raise
        logger.info("Using Deepgram STT + GPT-4o vision + Deepgram TTS (model=%s)", deepgram_model)
        agent = VisionExecutiveAssistantAgent(room=room, session=session)

        def _on_secretary_data(data_packet):
            try:
                payload = data_packet.data if hasattr(data_packet, "data") else data_packet
                data = json.loads(payload.decode("utf-8"))
                if data.get("type") == "secretary_context" and data.get("content"):
                    content = f"[Screen context from Secretary: {data['content']}]"
                    if hasattr(session, "update_chat_ctx") and session.update_chat_ctx:
                        session.update_chat_ctx(lambda ctx: ctx.append(text=content, role="user"))
                    elif hasattr(session, "chat_ctx") and session.chat_ctx is not None:
                        session.chat_ctx.append(text=content, role="user")
                    logger.info("Clarte received secretary context (%d chars)", len(data["content"]))
            except Exception as e:
                logger.debug("Secretary data handler failed: %s", e)

        room.on("data_received")(_on_secretary_data)

        room_opts = room_io.RoomOptions(video_input=True)
        await session.start(room=room, agent=agent, room_options=room_opts)
        # Opening greeting
        opening_phrases_by_lang = {
            "en": OPENING_PHRASES_EN,
            "ko": OPENING_PHRASES_KO,
            "es": OPENING_PHRASES_ES,
            "zh": OPENING_PHRASES_ZH,
            "hi": OPENING_PHRASES_HI,
            "ja": OPENING_PHRASES_JA,
        }
        follow_ups_by_lang = {"en": FOLLOW_UP_PHRASES_EN, "ko": FOLLOW_UP_PHRASES_KO}
        lang_key = language if language in opening_phrases_by_lang else "en"
        openings = opening_phrases_by_lang[lang_key]
        follow_ups = follow_ups_by_lang.get(lang_key, FOLLOW_UP_PHRASES_EN)
        if user_name and language == "ko":
            opening = f"안녕하세요, {user_name}님!"
        elif user_name and language == "en":
            opening = f"Hello, {user_name}!"
        elif user_name:
            opening = random.choice(openings).rstrip("!") + f", {user_name}!"
        else:
            opening = random.choice(openings)
        follow_up = random.choice(follow_ups)
        greeting_text = f"{opening} {follow_up}"
        if hasattr(session, "say"):
            await session.say(greeting_text)
        elif hasattr(session, "generate_reply"):
            await session.generate_reply(instructions=f'Say exactly: "{greeting_text}"')
        else:
            logger.warning("No say/generate_reply on session; skipping opening greeting")
    else:
        # Default: OpenAI Realtime (STT+LLM) + Deepgram TTS
        from openai.types.beta.realtime.session import TurnDetection
        turn_detection = TurnDetection(
            type="semantic_vad",
            eagerness="high",
            create_response=True,
            interrupt_response=True,
        )
        try:
            session = AgentSession(
                llm=openai.realtime.RealtimeModel(
                    model=OPENAI_REALTIME_MODEL,
                    modalities=["text"],
                    turn_detection=turn_detection,
                ),
                tts=deepgram.TTS(model=deepgram_model),
            )
        except Exception as e:
            logger.exception("Failed to initialize Deepgram TTS: %s (check DEEPGRAM_API_KEY and model=%s)", e, deepgram_model)
            raise
        logger.info("Using Deepgram TTS (model=%s) with OpenAI Realtime LLM (model=%s, language=%s, persona=%s)", deepgram_model, OPENAI_REALTIME_MODEL, language, voice)

        room_opts = room_io.RoomOptions(video_input=True)
        agent = ExecutiveAssistantAgent(room=room, session=session)

        def _on_secretary_data(data_packet):
            try:
                payload = data_packet.data if hasattr(data_packet, "data") else data_packet
                data = json.loads(payload.decode("utf-8"))
                if data.get("type") == "secretary_context" and data.get("content"):
                    content = f"[Screen context from Secretary: {data['content']}]"
                    if hasattr(session, "update_chat_ctx") and session.update_chat_ctx:
                        session.update_chat_ctx(lambda ctx: ctx.append(text=content, role="user"))
                    elif hasattr(session, "chat_ctx") and session.chat_ctx is not None:
                        session.chat_ctx.append(text=content, role="user")
                    logger.info("Clarte received secretary context (%d chars)", len(data["content"]))
            except Exception as e:
                logger.debug("Secretary data handler failed: %s", e)

        room.on("data_received")(_on_secretary_data)

        def on_user_input_transcribed(event: UserInputTranscribedEvent) -> None:
            """Forward user speech transcription to frontend for live transcript display (partial + final)."""
            transcript = (event.transcript or "").strip()
            if not transcript:
                return

            msg_type = "transcript_partial" if not event.is_final else "transcript_add"
            payload = json.dumps({"type": msg_type, "role": "user", "content": transcript})

            async def _publish() -> None:
                try:
                    await room.local_participant.publish_data(payload, reliable=True)
                except Exception as e:
                    logger.debug("transcript publish failed: %s", e)

            asyncio.create_task(_publish())

            if event.is_final:
                agent._persona_history.append(transcript)
                if len(agent._persona_history) > 5:
                    agent._persona_history.pop(0)
                agent._persona_turn_count += 1
                if agent._persona_turn_count >= 2:
                    agent._persona_turn_count = 0
                    detected = detect_persona(agent._persona_history)
                    if detected != agent._current_persona:
                        agent._current_persona = detected
                        logger.info("Persona auto-detected: %s", detected)

        session.on("user_input_transcribed")(on_user_input_transcribed)

        logger.info(
            "Starting session with model=%s, deepgram_model=%s (voice=%s, mode=%s, language=%s, user_name=%s)",
            OPENAI_REALTIME_MODEL, deepgram_model, voice, mode, language, user_name or "(none)",
        )
        await session.start(
            room=room,
            agent=agent,
            room_options=room_opts,
        )
        opening_phrases_by_lang = {
            "en": OPENING_PHRASES_EN,
            "ko": OPENING_PHRASES_KO,
            "es": OPENING_PHRASES_ES,
            "zh": OPENING_PHRASES_ZH,
            "hi": OPENING_PHRASES_HI,
            "ja": OPENING_PHRASES_JA,
        }
        follow_ups_by_lang = {"en": FOLLOW_UP_PHRASES_EN, "ko": FOLLOW_UP_PHRASES_KO}
        lang_key = language if language in opening_phrases_by_lang else "en"
        openings = opening_phrases_by_lang[lang_key]
        follow_ups = follow_ups_by_lang.get(lang_key, FOLLOW_UP_PHRASES_EN)
        if user_name and language == "ko":
            opening = f"안녕하세요, {user_name}님!"
        elif user_name and language == "en":
            opening = f"Hello, {user_name}!"
        elif user_name:
            opening = random.choice(openings).rstrip("!") + f", {user_name}!"
        else:
            opening = random.choice(openings)
        follow_up = random.choice(follow_ups)
        greeting = f'Say exactly: "{opening} {follow_up}"'
        await session.generate_reply(instructions=greeting)

    await asyncio.Future()


SECRETARY_CONTEXT_THROTTLE_SEC = 8
SECRETARY_PROMPT = (
    "Describe what you see in this image concisely in 1-3 sentences. "
    "Focus on: text content, UI elements, documents, code, or visible context that would help an assistant understand what the user is working on."
)


def _frame_to_base64(frame: rtc.VideoFrame) -> Optional[str]:
    """Convert LiveKit VideoFrame to base64 JPEG for OpenAI vision."""
    try:
        from livekit.agents.utils.images import encode, EncodeOptions, ResizeOptions
        import base64
        img_bytes = encode(
            frame,
            EncodeOptions(
                format="JPEG",
                quality=85,
                resize_options=ResizeOptions(width=640, height=480, strategy="scale_aspect_fit"),
            ),
        )
        return base64.b64encode(img_bytes).decode("utf-8")
    except Exception as e:
        logger.debug("Secretary frame encode failed: %s", e)
        return None


async def _secretary_analyze_frame(frame: rtc.VideoFrame) -> Optional[str]:
    """Use GPT-4o vision to analyze a video frame. Returns description or None."""
    b64 = _frame_to_base64(frame)
    if not b64:
        return None
    key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not key:
        return None
    try:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        res = client.chat.completions.create(
            model=SECRETARY_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": SECRETARY_PROMPT},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    ],
                }
            ],
            max_tokens=200,
        )
        if res.choices and res.choices[0].message.content:
            return res.choices[0].message.content.strip()
    except Exception as e:
        logger.debug("Secretary vision API failed: %s", e)
    return None


@server.rtc_session(agent_name="secretary")
async def secretary_entrypoint(ctx: agents.JobContext) -> None:
    """Secretary agent: observes screen/camera, sends context to Clarte via data channel. Silent by default (Option C)."""
    meta = _parse_metadata(getattr(ctx, "job", None))
    agent_mode = meta.get("agent_mode") or "silent_secretary"
    logger.info("secretary_entrypoint started agent_mode=%s", agent_mode)

    auto_sub = AutoSubscribe.SUBSCRIBE_ALL
    await ctx.connect(auto_subscribe=auto_sub)
    room = ctx.room

    latest_frame: Optional[rtc.VideoFrame] = None
    video_stream: Optional[rtc.VideoStream] = None
    video_tasks: list = []

    def _maybe_add_video(track) -> None:
        nonlocal video_stream, video_tasks
        if track and getattr(track, "kind", None) == rtc.TrackKind.KIND_VIDEO:
            if video_stream:
                try:
                    video_stream.close()
                except Exception:
                    pass
            video_stream = rtc.VideoStream(track)

            async def _read():
                nonlocal latest_frame
                try:
                    async for event in video_stream:
                        latest_frame = event.frame
                except Exception as e:
                    logger.debug("Secretary video stream error: %s", e)

            t = asyncio.create_task(_read())
            video_tasks.append(t)
            t.add_done_callback(lambda _: video_tasks.remove(t) if t in video_tasks else None)

    for p in room.remote_participants.values():
        for pub in p.track_publications.values():
            track = getattr(pub, "track", None)
            _maybe_add_video(track)

    @room.on("track_subscribed")
    def _on_track(track, publication, participant):
        _maybe_add_video(track)

    last_publish = 0.0

    async def _context_loop():
        nonlocal last_publish
        while True:
            await asyncio.sleep(SECRETARY_CONTEXT_THROTTLE_SEC)
            frame = latest_frame
            if not frame:
                continue
            if time.time() - last_publish < SECRETARY_CONTEXT_THROTTLE_SEC - 0.5:
                continue
            desc = await _secretary_analyze_frame(frame)
            if desc:
                try:
                    payload = json.dumps({"type": "secretary_context", "content": desc})
                    await room.local_participant.publish_data(payload, reliable=True)
                    last_publish = time.time()
                    logger.info("Secretary published context (%d chars)", len(desc))
                except Exception as e:
                    logger.debug("Secretary publish failed: %s", e)

    loop_task = asyncio.create_task(_context_loop())
    try:
        await asyncio.Future()
    finally:
        loop_task.cancel()
        try:
            await loop_task
        except asyncio.CancelledError:
            pass
        if video_stream:
            try:
                video_stream.close()
            except Exception:
                pass


if __name__ == "__main__":
    agents.cli.run_app(server)
