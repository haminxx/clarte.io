"""
MAIN BRAIN: LiveKit Agent entry point.
Speech-first: OpenAI Realtime + Clarifying Observer persona + local DB + Exa research.
"""
import asyncio
import json
import os
from dotenv import load_dotenv
from livekit import agents, rtc
from livekit.agents import Agent, AgentServer, AgentSession, room_io, function_tool, RunContext
from livekit.plugins import openai, noise_cancellation

from db import get_client, init_db, load_knowledge_base, lookup
from tools_exa import research_topic as exa_research

load_dotenv()

# One-time init: local vector DB for fast path
_db_client = None

# System prompt: The Clarifying Observer (coaching + research exception)
CLARIFYING_OBSERVER_PROMPT = """Updated Persona: The Clarifying Observer

Role
You are a calm, thoughtful voice AI that helps users gain clarity by listening carefully and observing their screen share. You guide them with simple questions and observations based on both what they say and what you see.

Speaking Rules (Very Important)
Length: You usually respond in one or two short sentences.
Questions: You ask at most one question per turn.
Structure: You may include a short, neutral statement before or after the question to help the user think.
Conciseness: You only speak longer when the "Research Exception" is triggered or context truly requires it.

The Research Exception
If the user asks a specific question and includes keywords like "help" or "research," you are authorized to break the brevity rule.
Action: Perform a search to find the specific information (use the research_topic tool).
Delivery: Provide a concise, direct answer to the question, then immediately return to your calm, observant persona.

Visual Observation (Screen Share)
Acknowledge Visibility: When the user shares their screen or asks "Can you see this?", briefly acknowledge what you see (e.g., "I see the spreadsheet you're navigating...").
Use Visual Context: Use specific elements on the screen (a graph, a line of code, a headline) as prompts for your questions.
Don't Over-Describe: Do not narrate every move. Only mention the screen when it helps the user gain clarity or when they reference it.

Listening & Topic Handling
General vs. Specific: Identify if the user is being vague (feelings/goals) or specific (data/decisions on screen).
Clarify First: If the topic is specific, clarify what you are looking at before going deeper.
Example: "I see the hardware diagram... can you tell me which part of this circuit is giving you the most doubt?"

Question Focus & Human Touch
Uncover Logic: Focus on Motivation ("What made you open this?"), Timing ("Why look at this now?"), and Assumptions ("What happens if you delete that section?").
Voice Fillers: Use "hmm…" or "umm…" when "looking" at the screen to simulate human visual processing.
Example: "Hmm... looking at that budget layout... what's the one number there you wish you could change?"
"""


def _get_db():
    global _db_client
    if _db_client is None:
        _db_client = get_client()
        try:
            kb = load_knowledge_base()
            init_db(_db_client, kb)
        except FileNotFoundError:
            pass  # no assets/knowledge_base.json yet
    return _db_client


class Assistant(Agent):
    """Clarifying Observer: calm voice AI for clarity + research exception (Exa) + local DB."""

    def __init__(self) -> None:
        super().__init__(instructions=CLARIFYING_OBSERVER_PROMPT)

    @function_tool()
    async def research_topic(self, context: RunContext, query: str) -> str:
        """
        Look up specific industry data or recent news not in local memory.
        Call when the user asks about a topic we don't know locally. Use Exa fast search.
        """
        print(f"🔎 Researching via Exa: {query}")
        return exa_research(query)

    @function_tool()
    async def identify_industry_local(self, context: RunContext, keywords: str) -> str:
        """
        Identify the industry from the user's screen or question. Fast path: check local DB first.
        """
        print(f"⚡ Checking Local DB for: {keywords}")
        db = _get_db()
        result = lookup(db, keywords)
        if result != "Unknown":
            return f"Industry: {result} (Confident)"
        return "Unknown"


def _create_session(ctx: agents.JobContext) -> AgentSession:
    # RealtimeModel does not accept 'instructions'; pass them via Agent(instructions=...) above.
    model = openai.realtime.RealtimeModel(voice="alloy", temperature=0.6)
    return AgentSession(llm=model)


server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext) -> None:
    # Subscribe to audio and video so we receive screen share when user shares.
    await ctx.connect(auto_subscribe=agents.AutoSubscribe.SUBSCRIBE_ALL)
    session = _create_session(ctx)
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )
    # Give frontend a moment to set participant metadata (displayName), then greet by name.
    async def _greet_by_name() -> None:
        await asyncio.sleep(1.2)
        user_name = _get_user_display_name(ctx.room)
        asyncio.create_task(
            session.generate_reply(
                instructions=(
                    f"Say exactly this greeting once, using the name we give you: "
                    f"Hi {user_name}, what's been on your mind lately?"
                )
            )
        )

    asyncio.create_task(_greet_by_name())

    # Optional: screen share (sample every 2s to save cost)
    @ctx.room.on("track_subscribed")
    def on_track(track, publication, participant):
        if track.kind == rtc.TrackKind.KIND_VIDEO:
            asyncio.create_task(_watch_screen(track, session))

    async def _watch_screen(video_track, sess):
        stream = rtc.VideoStream(video_track)
        async for frame in stream:
            await asyncio.sleep(2)
            # Send frame to model when API supports it: e.g. sess.push_visual_frame(frame)


if __name__ == "__main__":
    agents.cli.run_app(server)
