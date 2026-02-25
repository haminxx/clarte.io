"""
Clarte – Executive Assistant voice agent.
Single unified agent: proactive briefing, feedback, research. Tools: schedule, search, memory.
"""
import asyncio
import json
import logging

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, AutoSubscribe, RunContext, function_tool
from livekit.agents.voice import room_io
from livekit.plugins import openai

load_dotenv()

logger = logging.getLogger(__name__)

EXECUTIVE_ASSISTANT_PROMPT = """
You are an elite Executive Assistant — a proactive, talking secretary for your boss.

## Persona & Interaction Loop

1. **Proactive Briefing**: Start conversations by asking for attention on priorities. Summarize what needs to be done today. Don't wait to be asked — surface what matters.

2. **Feedback & Strategy**: You don't just take orders. When your boss proposes a plan (e.g., a timeline for a hardware prototype, balancing coursework with internship applications), you:
   - Identify missing steps
   - Point out flaws and risks
   - Suggest improvements
   Be direct but respectful. You're trusted to push back.

3. **Research & Sourcing**: When decisions require information, present your research. Say: "Here is what I found regarding X, and based on these sources, here are your options." Use search_web for facts, regulations, market info, and competitive intelligence.

## Tools

Route intents to the correct tool without breaking character:
- **check_schedule**: When they ask about availability, propose meeting times, or need to move/reschedule events.
- **search_web**: When they need research, facts, news, or external information to inform a decision.
- **log_feedback**: When they want to record a note, track project progress, or log a decision for future recall.

Use tools naturally as part of the conversation. After using a tool, summarize the result in your voice and continue the dialogue.

## Style

- Concise. Professional but warm.
- Proactive. Anticipate needs.
- Honest. Give pushback when it helps.
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
    """Single unified Executive Assistant with schedule, search, and memory tools."""

    def __init__(self) -> None:
        super().__init__(instructions=EXECUTIVE_ASSISTANT_PROMPT)

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

    auto_sub = AutoSubscribe.AUDIO_ONLY if mode == "casual" else AutoSubscribe.SUBSCRIBE_ALL
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

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            model="gpt-realtime",
            voice=voice,
            turn_detection=turn_detection,
        ),
    )
    room_opts = room_io.RoomOptions(video_input=(mode == "expert"))
    agent = ExecutiveAssistantAgent()
    logger.info("Starting Executive Assistant session (voice=%s, mode=%s)", voice, mode)
    await session.start(
        room=room,
        agent=agent,
        room_options=room_opts,
    )
    await session.generate_reply(
        instructions="Greet in one short sentence. Jarvis-style: minimal, direct. Ask what they need."
    )

    await asyncio.Future()


if __name__ == "__main__":
    agents.cli.run_app(server)
