"""
MAIN BRAIN: LiveKit Agent entry point.
Speech-first: OpenAI Realtime + local DB (fast path) + Exa research (parallel when needed).
"""
import asyncio
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
    """Voice assistant with fast path (local DB) and research path (Exa)."""

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
    model = openai.realtime.RealtimeModel(
        voice="alloy",
        instructions=(
            "You are a fast, helpful voice assistant. "
            "1. If the user asks a simple question, answer immediately. "
            "2. If they ask for recent news or deep data, use the 'research_topic' tool. "
            "3. While researching, say something like 'Checking that for you...' to fill the silence. "
            "4. Use 'identify_industry_local' for industry context when relevant."
        ),
        temperature=0.6,
    )
    return AgentSession(llm=model)


server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext) -> None:
    await ctx.connect(auto_subscribe=agents.AutoSubscribe.AUDIO_ONLY)
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
    await session.generate_reply(instructions="Greet the user and offer your assistance.")

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
