"""
Clarte Voice Agent - Pipecat Pipeline
Direct Multimodal Live: DailyTransport -> SileroVAD -> GeminiMultimodalLiveService
Video frames and audio flow in a single WebRTC stream for <1s latency.

Required env vars (set in Render dashboard or .env):
  GEMINI_API_KEY or GOOGLE_API_KEY - Google AI Studio / Gemini API key

Tuning: system prompt, voice, VAD, and adding features → see docs/VOICE_AI_TUNING.md
"""
import asyncio
import os
from typing import Optional

from dotenv import load_dotenv
from loguru import logger

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.services.gemini_multimodal_live.gemini import GeminiMultimodalLiveLLMService
try:
    from pipecat.transports.services.daily import DailyParams, DailyTransport
except ImportError:
    from pipecat.transports.daily.transport import DailyParams, DailyTransport
from pipecat.turns.user_stop import TurnAnalyzerUserTurnStopStrategy
from pipecat.turns.user_turn_strategies import UserTurnStrategies
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3

load_dotenv()


def create_pipeline(room_url: str, room_token: str) -> Pipeline:
    """Build the Clarte pipeline: Daily -> SileroVAD -> Gemini Multimodal Live (with video input)."""
    transport = DailyTransport(
        room_url,
        room_token,
        "Clarte Voice Agent",
        DailyParams(
            audio_in_sample_rate=16000,
            audio_out_enabled=True,
            audio_out_sample_rate=24000,
            transcription_enabled=False,
            vad_enabled=True,
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
            vad_audio_passthrough=True,
        ),
    )

    # Gemini 2.0/2.5 Flash Live - native multimodal (audio + video)
    gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required")

    llm = GeminiMultimodalLiveLLMService(
        api_key=gemini_api_key,
        voice_id="Aoede",  # Options: Puck, Charon, Kore, Fenrir, Aoede
        system_instruction=(
            "You are Clarte, a helpful voice AI assistant. You can see the user's screen when they share it. "
            "Reference what you see on screen when relevant. Be concise and natural for voice conversation."
        ),
        transcribe_user_audio=True,
        transcribe_model_audio=True,
        inference_on_context_initialization=False,
        # Enable video input so Gemini receives raw video frames from Daily
        video_input=True,
    )

    messages = [
        {
            "role": "system",
            "content": "You are Clarte. When the user shares their screen, you see it in real time. Use that context to help them. Keep responses natural for voice.",
        },
    ]
    context = LLMContext(messages)
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            user_turn_strategies=UserTurnStrategies(
                stop=[TurnAnalyzerUserTurnStopStrategy(turn_analyzer=LocalSmartTurnAnalyzerV3())]
            ),
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
        ),
    )

    processors = [
        transport.input(),
        user_aggregator,
        llm,
        transport.output(),
        assistant_aggregator,
    ]

    pipeline = Pipeline(processors)

    # Capture participant video (camera and/or screen share) so Gemini receives frames
    @transport.event_handler("on_first_participant_joined")
    async def on_first_participant_joined(transport, participant):
        participant_id = participant.get("id")
        if participant_id:
            await transport.capture_participant_video(
                participant_id, framerate=1, video_source="camera"
            )
            await transport.capture_participant_video(
                participant_id, framerate=1, video_source="screenVideo"
            )
        logger.info(f"First participant joined: {participant_id}, video capture enabled")

    @transport.event_handler("on_participant_joined")
    async def on_participant_joined(transport, participant):
        logger.info(f"Participant joined: {participant.get('id')}")

    @transport.event_handler("on_participant_left")
    async def on_participant_left(transport, participant, reason):
        logger.info(f"Participant left: {participant.get('id')}, reason: {reason}")

    return pipeline


async def run_bot(room_url: str, room_token: str) -> None:
    """Run the Clarte bot in the given Daily room."""
    pipeline = create_pipeline(room_url, room_token)
    task = PipelineTask(
        pipeline,
        params=PipelineParams(enable_metrics=True, enable_usage_metrics=True),
    )
    runner = PipelineRunner()
    await runner.run(task)


def main(room_url: Optional[str] = None, room_token: Optional[str] = None) -> None:
    """Entry point: run bot with room_url and room_token from env or args."""
    url = room_url or os.getenv("DAILY_ROOM_URL")
    token = room_token or os.getenv("DAILY_ROOM_TOKEN")
    if not url or not token:
        raise SystemExit("Set DAILY_ROOM_URL and DAILY_ROOM_TOKEN, or pass room_url and room_token")
    asyncio.run(run_bot(url, token))


if __name__ == "__main__":
    main()
