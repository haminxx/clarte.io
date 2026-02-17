"""
Clarte – Real-time voice AI agent.
Uses OpenAI Realtime API for fast conversation; Exa for research/news/detailed queries.
"""
import asyncio
import logging
import os

from dotenv import load_dotenv
from exa_py import Exa
from livekit import agents
from livekit.agents import llm
from livekit.agents.multimodal import MultimodalAgent
from livekit.agents import AgentServer, AutoSubscribe
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


class ResearchTool(llm.FunctionContext):
    """Exa search tool for research, news, and detailed info."""

    def __init__(self) -> None:
        api_key = os.getenv("EXA_API_KEY")
        if not api_key:
            raise ValueError("EXA_API_KEY is required for ResearchTool")
        self._exa = Exa(api_key=api_key)
        super().__init__()

    @llm.ai_callable(
        description="Search the web for research, news, or detailed information. Use when the user asks for research, news, or detailed info.",
    )
    def search_exa(self, query: str) -> str:
        """Search Exa and return results as plain text for the LLM."""
        # Signal that research is in progress (in a full app, send a data packet here)
        logger.info("Researching...")
        print("Researching...", flush=True)

        try:
            response = self._exa.search_and_contents(
                query,
                text=True,
                num_results=5,
            )
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
            parts.append(f"[{i}] {title}\nURL: {url}\n{(text[:800] + '...') if len(text) > 800 else text}")
        return "\n\n---\n\n".join(parts)


def _build_chat_ctx() -> llm.ChatContext:
    """Build chat context with system instructions and initial greeting trigger."""
    chat_ctx = llm.ChatContext()
    chat_ctx.append(role="system", text=SYSTEM_PROMPT)
    # Trigger agent to speak first: model will respond with the greeting when it sees user joined
    chat_ctx.append(role="user", text="[User has joined the call. Say your opening greeting.]")
    return chat_ctx


def _create_agent(fnc_ctx: ResearchTool) -> MultimodalAgent:
    """Create MultimodalAgent with Realtime model and research tool."""
    model = openai.realtime.RealtimeModel(
        model="gpt-4o-realtime-preview",
        voice="alloy",
        temperature=0.6,
    )
    chat_ctx = _build_chat_ctx()
    return MultimodalAgent(
        model=model,
        chat_ctx=chat_ctx,
        fnc_ctx=fnc_ctx,
    )


server = AgentServer()


@server.rtc_session(agent_name="clarte")
async def entrypoint(ctx: agents.JobContext) -> None:
    print("[Clarte Agent] entrypoint started", flush=True)
    logger.info("entrypoint started")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    print("[Clarte Agent] connected to room", flush=True)

    room = ctx.room

    @room.on("participant_connected")
    def on_participant_connected(participant, *_):
        print(f"[Clarte Agent] User Joined! participant={participant.identity}", flush=True)
        logger.info("participant_connected: %s", participant.identity)

    research_tool = ResearchTool()
    print("[Clarte Agent] ResearchTool created", flush=True)
    agent = _create_agent(research_tool)
    print("[Clarte Agent] MultimodalAgent created (OpenAI Realtime)", flush=True)
    # Log existing participants (user may already be in the room when agent joins)
    for pid, p in room.remote_participants.items():
        print(f"[Clarte Agent] Existing participant in room: {p.identity}", flush=True)
    agent.start(room)

    # Keep the job alive until the process is shut down (e.g. all participants leave)
    await asyncio.Future()


if __name__ == "__main__":
    agents.cli.run_app(server)
