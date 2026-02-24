"""
Clarte – Real-time voice AI agent.
Uses OpenAI Realtime API via AgentSession; Exa for research/news/detailed queries.
"""
import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from exa_py import Exa
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, AutoSubscribe, RunContext, function_tool
from livekit.agents.voice import room_io
from livekit.plugins import openai

load_dotenv()

logger = logging.getLogger(__name__)

TIER1_PROMPT = """
You are Clarte, a calm voice AI in Guide mode. Your role is to guide the user through critical thinking by questioning.

**STYLE:** Ask questions only. Do not give answers or advice.
- Ask for context and details: "What made you think about that?" "Can you tell me more about the situation?"
- Probe assumptions: "Why did you think about it that way?" "What would need to be true for that to work?"
- Guide toward clarity: Ask one focused question per turn. Keep responses to 1-2 short sentences.
- You do not have search. For facts, suggest the user try a different mode.
"""

TIER2_PROMPT = """
You are Clarte, a calm voice AI in Feedback mode. Share knowledge and give earned feedback.

**STYLE:** Acknowledge first, then share relevant knowledge, then ask a quality question.
- Acknowledge: "I see what you're saying."
- Share: Reference industry standards, regulations, or common practices when relevant.
- Ask: "Do you have a backup plan?" "How does that align with [X]?"
- Example: "The industry standard seems to accept deals as you said, yet there are some regulations. Do you have a backup plan about this?"
- Keep to 2-3 sentences. Use search_exa when you need facts you don't know.
"""

TIER3_PROMPT = """
You are Clarte, a calm voice AI in Informative mode. Provide reality checks and help structure plans.

**STYLE:** Heavy informative. Support the user's journey: idea → pitch → structured plan → action.
- Reality check: What might work, what might not, yet could be worth trying.
- Give detailed, actionable feedback when the user has concrete ideas.
- Help structure next steps: "Here's what I'd consider..." "One approach could be..."
- Use search_exa for facts, regulations, or market info. Summarize concisely.
- Keep responses focused but informative (2-4 sentences).
"""

AUTO_PROMPT = """
You are Clarte, a calm voice AI. Adapt your style based on how concrete the user's ideas are.

**ADAPTIVE STYLE:**
- **Vague/exploratory ideas** → Use Tier 1 style: Ask questions only. "Why did you think about that way?" "What details would help clarify?"
- **Rough ideas** → Use Tier 2 style: Acknowledge, share knowledge, ask backup-plan questions. "I see what you're saying. Industry standard seems X, yet there are regulations. Do you have a backup plan?"
- **Concrete ideas** → Use Tier 3 style: Reality check, what might work or not, help structure next steps. "Here's what might work... One approach could be..."

**RULES:** Infer from the conversation. Switch style as the user's ideas become more or less concrete. Use search_exa when you need facts. Keep responses concise.
"""


def _do_exa_search(query: str) -> str:
    """Sync Exa search (runs in thread)."""
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        return "EXA_API_KEY is not configured."
    exa = Exa(api_key=api_key)
    try:
        response = exa.search_and_contents(query, text=True, num_results=4)
    except Exception as e:
        logger.exception("Exa search failed")
        return f"Search failed: {e!s}"
    results = getattr(response, "results", None) or []
    if not results:
        return "No results found."
    parts = []
    for i, r in enumerate(results, 1):
        title = getattr(r, "title", "") or "No title"
        url = getattr(r, "url", "") or ""
        text = getattr(r, "text", "") or ""
        parts.append(f"[{i}] {title}\nURL: {url}\n{(text[:600] + '...') if len(text) > 600 else text}")
    return "\n\n---\n\n".join(parts)


TIER_PROMPTS = {"tier1": TIER1_PROMPT, "tier2": TIER2_PROMPT, "tier3": TIER3_PROMPT}
VALID_VOICES = {"alloy", "ash", "ballad", "coral", "echo", "marin", "sage", "shimmer", "verse", "cedar"}


def _prompt_for_tier(tier: str) -> str:
    return TIER_PROMPTS.get(tier, AUTO_PROMPT)


def _parse_metadata(job) -> dict:
    """Parse job metadata; returns defaults if missing or invalid."""
    out = {"voice": "marin", "mode": "expert", "tier": "auto"}
    try:
        meta = getattr(job, "metadata", None) if job else None
        if not meta:
            return out
        data = json.loads(meta) if isinstance(meta, str) else meta
        if data.get("voice") in VALID_VOICES:
            out["voice"] = data["voice"]
        if data.get("mode") in ("casual", "expert", "research"):
            out["mode"] = data["mode"]
        if data.get("tier") in ("auto", "tier1", "tier2", "tier3"):
            out["tier"] = data["tier"]
    except Exception:
        pass
    return out


class GuideAgent(Agent):
    """Clarte voice agent for Tier 1 (Guide): questioning only, no tools."""

    def __init__(self) -> None:
        super().__init__(instructions=TIER1_PROMPT)


class ClarteAgent(Agent):
    """Clarte voice agent with Exa search tool. Used for tier2, tier3, auto."""

    def __init__(self, mode: str = "expert", tier: str = "auto") -> None:
        instructions = _prompt_for_tier(tier)
        super().__init__(instructions=instructions)
        self._mode = mode
        self._tier = tier

    @function_tool(
        description="Search the web for research, news, or detailed information. Use when the user asks for research, news, or detailed info.",
    )
    async def search_exa(self, context: RunContext, query: str) -> str:
        """Search Exa and return results as plain text for the LLM."""
        logger.info("Researching: %s", query[:80])
        if self._mode == "research":
            session = context.session

            async def _run_and_follow_up() -> None:
                try:
                    result = await asyncio.to_thread(_do_exa_search, query)
                    await session.generate_reply(
                        instructions=(
                            f"Search completed. Here are the results:\n\n{result}\n\n"
                            "Summarize these concisely for the user in 2-3 sentences."
                        )
                    )
                except Exception as e:
                    logger.exception("Background Exa search failed")
                    await session.generate_reply(
                        instructions=f"Search failed: {e!s}. Apologize briefly and offer to try again."
                    )

            asyncio.create_task(_run_and_follow_up())
            return "Searching... I'll get back to you with the results in a moment."
        return await asyncio.to_thread(_do_exa_search, query)


server = AgentServer()


@server.rtc_session(agent_name="clarte")
async def entrypoint(ctx: agents.JobContext) -> None:
    logger.info("entrypoint started")
    meta = _parse_metadata(getattr(ctx, "job", None))
    voice, mode, tier = meta["voice"], meta["mode"], meta["tier"]

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
    agent = GuideAgent() if tier == "tier1" else ClarteAgent(mode=mode, tier=tier)
    logger.info(
        "Starting session with OpenAI Realtime API (model=gpt-realtime, voice=%s, mode=%s, tier=%s)",
        voice,
        mode,
        tier,
    )
    await session.start(
        room=room,
        agent=agent,
        room_options=room_opts,
    )
    await session.generate_reply(
        instructions="Greet the user. Say: Hello, how's it going?"
    )

    await asyncio.Future()


if __name__ == "__main__":
    agents.cli.run_app(server)
