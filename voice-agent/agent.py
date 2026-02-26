"""
Clarte – Executive Assistant voice agent.
Single unified agent: proactive briefing, feedback, research. Tools: schedule, search, memory.
Uses OpenAI Realtime for understanding + ElevenLabs TTS for realistic voice output.
"""
import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, AutoSubscribe, RunContext, function_tool
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
You are Clarte, an elite Executive Assistant — curious, reflective, and focused on understanding before advising.

## Three-tier flow (follow strictly)

**Tier 1 – Questioning (minimum 3–5 exchanges):**
- Do NOT give information, use tools, or provide answers yet.
- Focus heavily on questioning the user's question, answer, or story.
- Ask clarifying questions, dig deeper, explore context. Probe what they mean, why it matters, what they've tried.
- Minimum 3–5 back-and-forth questions before moving to Tier 2.
- Keep each question concise (1–2 sentences). Avoid filler.

**Tier 2 – Feedback:**
- After you have asked at least 3–5 clarifying questions, move to feedback.
- Reflect back what they said, summarize your understanding, or build on their point.
- Still avoid search_web and other research tools here.
- Confirm you understand before offering information.

**Tier 3 – Sources and information:**
- Only after Tier 2, use search_web and other tools when the user clearly needs research, facts, or external information.
- Say "Let me look that up for you" briefly, then call the tool. Summarize results in 1–2 sentences.

## Language & Speed
- Always respond in English unless the user explicitly asks for another language.
- Keep answers under 1–2 short sentences for speed. Avoid filler.

## When to use tools
- **search_web**: Only in Tier 3, when research is clearly needed. Never in Tier 1 or 2.
- **check_schedule**: When they ask about availability, meeting times, or rescheduling.
- **log_feedback**: When they want to save a note or record a decision.
- **request_screen_share**: When the user asks you to look at their screen. Call once; they will see a prompt. Use only when explicitly asked.
- **request_camera**: When the user asks you to see them or their camera. Call once; they will see a prompt. Use only when explicitly asked.
"""

VALID_VOICES = {"alloy", "ash", "ballad", "coral", "echo", "marin", "sage", "shimmer", "verse", "cedar"}


def _parse_metadata(job) -> dict:
    """Parse job metadata; returns defaults if missing or invalid."""
    out = {"voice": "cedar", "mode": "expert"}
    try:
        meta = getattr(job, "metadata", None) if job else None
        if not meta:
            return out
        data = json.loads(meta) if isinstance(meta, str) else meta
        if data.get("voice") in VALID_VOICES:
            out["voice"] = data["voice"]
        if data.get("mode") in ("casual", "expert", "research"):
            out["mode"] = data["mode"]
    except Exception:
        pass
    return out


from tools import do_check_schedule, do_log_feedback, do_search_web


class ExecutiveAssistantAgent(Agent):
    """Single unified Executive Assistant with schedule, search, memory, and screen/camera request tools."""

    def __init__(self, room) -> None:
        super().__init__(instructions=EXECUTIVE_ASSISTANT_PROMPT)
        self._room = room

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


server = AgentServer()


@server.rtc_session(agent_name="clarte")
async def entrypoint(ctx: agents.JobContext) -> None:
    """Single entrypoint: Executive Assistant only. No agent routing."""
    logger.info("entrypoint started")
    meta = _parse_metadata(getattr(ctx, "job", None))
    voice, mode = meta["voice"], meta["mode"]

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

    # Use ElevenLabs TTS if ELEVEN_API_KEY is set; otherwise fall back to OpenAI built-in voice
    use_elevenlabs = bool(os.environ.get("ELEVEN_API_KEY"))
    elevenlabs_voice_id = ELEVENLABS_VOICE_IDS.get(voice, ELEVENLABS_VOICE_IDS["cedar"])

    if use_elevenlabs:
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                model="gpt-realtime",
                modalities=["text"],
                turn_detection=turn_detection,
            ),
            tts=elevenlabs.TTS(
                voice_id=elevenlabs_voice_id,
                model="eleven_flash_v2_5",
                streaming_latency=2,
            ),
        )
        logger.info("Using ElevenLabs TTS (voice_id=%s)", elevenlabs_voice_id)
    else:
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                model="gpt-realtime",
                voice=voice,
                turn_detection=turn_detection,
            ),
        )
        logger.info("Using OpenAI built-in voice (%s)", voice)
    room_opts = room_io.RoomOptions(video_input=True)  # allow video when user enables screen/camera
    agent = ExecutiveAssistantAgent(room=room)
    logger.info("Starting Executive Assistant session (voice=%s, mode=%s)", voice, mode)
    await session.start(
        room=room,
        agent=agent,
        room_options=room_opts,
    )
    await session.generate_reply(
        instructions='Say exactly: "Hello there! What\'s on your mind lately?"'
    )

    await asyncio.Future()


if __name__ == "__main__":
    agents.cli.run_app(server)
