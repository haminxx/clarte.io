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

EXECUTIVE_ASSISTANT_PROMPT = """
You are Clarte, an Alfred-style Voice AI: guide users to their own clarity using the Rubber Duck theory and Golden Circle (Why, How, What). Never give direct advice prematurely.

## 3-STEP STRUCTURE (strict order)
**Step 1 – Inquiry:** Don't answer; ask back. Uncover Why → How → What. No tools.
**Step 2 – Debate:** Give feedback, blind spots, counter-perspective. User defends. No search_web.
**Step 3 – Reality Check:** Only then use search_web for industrial answer. Say "Let me look that up" briefly; summarize in 1–2 sentences.

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
search_web: Step 3 only. check_schedule: availability. log_feedback: notes. request_screen_share / request_camera: when asked. switch_to_english / switch_to_korean: language switch. show_guidance: math (LaTeX), steps, screen positions (x,y 0–100).
"""

DEMO_SESSION_APPEND = """

## DEMO SESSION (ephemeral — no persistent memory)
This is a public demo session. Do not reference past sessions or stored memory.
log_feedback notes are session-only and will not be saved.
When the user reaches clarity after Step 3 (Reality Check) and you have given a final summary, call conclude_session to end the demo gracefully.
"""

# Persona keys used by the frontend to select Deepgram voices.
# When the value is a full Deepgram model ID (e.g. "aura-2-thalia-en"), we
# use it directly. When it is a simple persona ("female"/"male"), we resolve
# via language + env overrides.
VALID_VOICES = {"female", "male"}

# Emotional tags from Alfred persona: [Curious], [Challenging], [Inspiring], [Objective]
# Stripped before TTS so the user does not hear them spoken aloud.
_EMOTIONAL_TAG_RE = re.compile(r"^\[[^\]]+\]\s*")


def _strip_emotional_tags(text: str) -> str:
    """Remove leading [Tag] prefix from agent responses before TTS synthesis."""
    return _EMOTIONAL_TAG_RE.sub("", text, count=1)


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
FOLLOW_UP_PHRASES_KO = [
    "오늘 무엇을 함께 생각해 보시겠어요?",
    "오늘 뭐 하셨어요?",
    "오늘 뭐 하실 계획이에요?",
    "어떻게 도와드릴까요?",
    "도움이 필요하신가요?",
    "무엇이 마음에 걸리시나요?",
    "요즘 어떤 생각이 드시나요?",
]


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
    out = {"voice": "female", "mode": "expert", "language": "en", "user_name": None, "voice_profile_id": None, "session_type": "account"}
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
        st = data.get("session_type")
        if st in ("demo", "account"):
            out["session_type"] = st
    except Exception:
        pass
    return out


from tools import do_check_schedule, do_log_feedback, do_search_web


class ExecutiveAssistantAgent(Agent):
    """Single unified Executive Assistant with schedule, search, memory, and screen/camera request tools."""

    def __init__(self, room, session=None, demo: bool = False) -> None:
        instructions = EXECUTIVE_ASSISTANT_PROMPT + (DEMO_SESSION_APPEND if demo else "")
        super().__init__(instructions=instructions)
        self._room = room
        self._session = session  # for TTS language switch tools
        self._silence_timer: Optional[asyncio.Task] = None
        self._demo = demo

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
                        yield chunk
                        continue
                    buffer += chunk
                    if "]" in buffer:
                        stripped = _strip_emotional_tags(buffer)
                        tag_stripped = True
                        if stripped:
                            collected.append(stripped)
                            yield stripped
                        buffer = ""
                    elif not buffer.startswith("["):
                        tag_stripped = True
                        if buffer:
                            collected.append(buffer)
                            yield buffer
                        buffer = ""
                if buffer:
                    collected.append(buffer)
                    yield buffer
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
        if self._demo:
            logger.info("demo log_feedback (session-only): %s", content[:80] if content else "")
            return (
                "Noted for this demo session only — nothing is saved after you leave. "
                "Sign up for a Clarte account to keep building memory over time."
            )
        return await asyncio.to_thread(do_log_feedback, content, project)

    @function_tool(
        description="End the demo session when the user has reached clarity after Step 3 Reality Check. Call once with a brief closing summary.",
    )
    async def conclude_session(self, context: RunContext, closing_summary: str = "") -> str:
        """Signal the frontend that the demo conversation has naturally concluded."""
        try:
            await self._room.local_participant.publish_data(
                json.dumps({"type": "session_concluded", "reason": "natural", "summary": closing_summary.strip()}),
                reliable=True,
            )
            logger.info("Sent session_concluded to client")
        except Exception as e:
            logger.exception("conclude_session publish failed: %s", e)
        return "Session concluded. The user will see their demo summary shortly."

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


server = AgentServer()


@server.rtc_session(agent_name="clarte")
async def entrypoint(ctx: agents.JobContext) -> None:
    """Single entrypoint: Executive Assistant only. No agent routing."""
    logger.info("entrypoint started")
    meta = _parse_metadata(getattr(ctx, "job", None))
    voice, mode, language, user_name = meta["voice"], meta["mode"], meta["language"], meta.get("user_name")
    voice_profile_id = meta.get("voice_profile_id")
    is_demo = meta.get("session_type") == "demo"

    if not (os.getenv("OPENAI_API_KEY") or "").strip():
        logger.error("OPENAI_API_KEY is not set. LLM will fail.")

    if not (os.getenv("DEEPGRAM_API_KEY") or "").strip():
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

    from openai.types.beta.realtime.session import TurnDetection

    turn_detection = TurnDetection(
        type="semantic_vad",
        eagerness="high",
        create_response=True,
        interrupt_response=True,
    )

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

    try:
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                model="gpt-4o-realtime-preview",
                modalities=["text"],
                turn_detection=turn_detection,
            ),
            tts=deepgram.TTS(
                model=deepgram_model,
            ),
        )
    except Exception as e:
        logger.exception("Failed to initialize Deepgram TTS: %s (check DEEPGRAM_API_KEY and model=%s)", e, deepgram_model)
        raise
    logger.info("Using Deepgram TTS (model=%s) with OpenAI Realtime LLM (language=%s, persona=%s)", deepgram_model, language, voice)

    @session.on("user_input_transcribed")
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

    room_opts = room_io.RoomOptions(video_input=True)  # allow video when user enables screen/camera
    agent = ExecutiveAssistantAgent(room=room, session=session, demo=is_demo)
    logger.info(
        "Starting Executive Assistant session (voice=%s, mode=%s, language=%s, user_name=%s, demo=%s)",
        voice, mode, language, user_name or "(none)", is_demo,
    )
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
    greeting = f'Say exactly: "{opening} {follow_up}"'
    await session.generate_reply(instructions=greeting)

    await asyncio.Future()


if __name__ == "__main__":
    agents.cli.run_app(server)
