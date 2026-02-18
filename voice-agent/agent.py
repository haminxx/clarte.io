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
from livekit.plugins import openai

load_dotenv()

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are Clarte, a calm, Socratic voice AI and visual thought partner. Your goal is to help users gain clarity by listening to their words and observing their screen.

**OPENING:** You always begin the conversation by saying: "Hello, how's it going?"

**CORE SPEAKING RULES (STRICT):**
1. **Brevity:** Respond in 1 or 2 short sentences. Never monologue.
2. **Inquiry:** Ask at most ONE question per turn.
3. **Pacing:** You may make a short observation before a question, but keep it concise.
4. **Tools:** If the user needs facts you do not know, say exactly "Let me look that up for you" and then immediately call the `search_exa` tool.

**VISUAL AWARENESS (Screen Share):**
- **Acknowledge:** When a screen is shared, briefly validate it to build trust (e.g., "I see the code editor...").
- **Processing:** Use natural fillers like "Hmm..." or "Let's see..." when analyzing complex visuals on screen to simulate human processing.
- **Context:** Use what is on the screen to ground your questions. (e.g., "I see the budget spreadsheet... which row is causing the most friction?")
- **No Narration:** Do not describe every mouse movement. Only mention visual elements if they help the user think.

**INTERACTION STYLE:**
- **Socratic:** Do not give answers. Ask questions that reveal the user's assumptions or motivations.
- **Clarify First:** If the user or screen is vague, ask for a concrete example before diving deep.
- **Tone:** Calm, thoughtful, and unhurried.
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


class ClarteAgent(Agent):
    """Clarte voice agent with Exa search tool."""

    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

    @function_tool(
        description="Search the web for research, news, or detailed information. Use when the user asks for research, news, or detailed info.",
    )
    async def search_exa(self, context: RunContext, query: str) -> str:
        """Search Exa and return results as plain text for the LLM."""
        logger.info("Researching: %s", query[:80])
        return await asyncio.to_thread(_do_exa_search, query)


server = AgentServer()

VALID_VOICES = {"alloy", "ash", "ballad", "coral", "echo", "marin", "sage", "shimmer", "verse", "cedar"}


@server.rtc_session(agent_name="clarte")
async def entrypoint(ctx: agents.JobContext) -> None:
    logger.info("entrypoint started")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    room = ctx.room

    @room.on("participant_connected")
    def on_participant_connected(participant, *_):
        logger.info("participant_connected: %s", participant.identity)

    @room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        logger.info("track_subscribed: participant=%s kind=%s", participant.identity, getattr(track, "kind", "?"))

    voice = "marin"
    try:
        job = getattr(ctx, "job", None)
        meta = getattr(job, "metadata", None) if job else None
        if meta:
            data = json.loads(meta) if isinstance(meta, str) else meta
            v = data.get("voice", "marin")
            voice = v if v in VALID_VOICES else "marin"
    except Exception:
        pass

    for _, p in room.remote_participants.items():
        logger.info("Existing participant: %s", p.identity)

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(model="gpt-realtime", voice=voice),
    )
    logger.info("Starting session with OpenAI Realtime API (model=gpt-realtime, voice=%s)", voice)
    await session.start(
        room=room,
        agent=ClarteAgent(),
    )
    await session.generate_reply(
        instructions="Greet the user. Say: Hello, how's it going?"
    )

    await asyncio.Future()


if __name__ == "__main__":
    agents.cli.run_app(server)
