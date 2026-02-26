"""
Token server: issues LiveKit access tokens for the frontend.
Run with the agent on Render so the frontend can get a token and join a room.
Also provides /realtime WebSocket for Tier 1 (voice-only, no LiveKit).
"""
import json
import logging
import os
import uuid
from typing import Optional

logger = logging.getLogger(__name__)

from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

app = FastAPI(title="Clarte Token Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_VOICES = frozenset({"alloy", "ash", "ballad", "coral", "echo", "marin", "sage", "shimmer", "verse", "cedar"})


VALID_MODES = frozenset({"casual", "expert", "research"})
VALID_LANGUAGES = frozenset({"en", "ko"})


class TokenRequest(BaseModel):
    identity: Optional[str] = None
    room_name: Optional[str] = None
    voice: Optional[str] = None
    mode: Optional[str] = None
    language: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.websocket("/realtime")
async def realtime_websocket(websocket: WebSocket):
    """Tier 1: Voice-only relay to OpenAI Realtime API. No LiveKit."""
    await websocket.accept()
    from realtime_relay import handle_realtime_websocket

    await handle_realtime_websocket(websocket)


@app.post("/token")
def get_token(body: Optional[TokenRequest] = Body(None)):
    """Return a LiveKit token and room name for the frontend."""
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(status_code=503, detail="LiveKit API key/secret not configured")

    identity = body.identity if body else None
    room_name = body.room_name if body else None
    raw_voice = (body.voice if body else None) or "marin"
    voice = raw_voice if raw_voice in VALID_VOICES else "marin"
    raw_mode = (body.mode if body else None) or "expert"
    mode = raw_mode if raw_mode in VALID_MODES else "expert"
    raw_language = (body.language if body else None) or "en"
    language = raw_language if raw_language in VALID_LANGUAGES else "en"

    try:
        from livekit.api import (
            AccessToken,
            RoomAgentDispatch,
            RoomConfiguration,
            VideoGrants,
        )

        at = AccessToken(api_key=LIVEKIT_API_KEY, api_secret=LIVEKIT_API_SECRET)
        at.with_identity(identity or str(uuid.uuid4()))
        at.with_name(identity or "user")
        room = room_name or f"clarte-{uuid.uuid4().hex[:12]}"
        at.with_grants(VideoGrants(room_join=True, room=room))
        at.with_room_config(
            RoomConfiguration(
                agents=[
                    RoomAgentDispatch(
                        agent_name="clarte",
                        metadata=json.dumps({"voice": voice, "mode": mode, "language": language}),
                    )
                ],
            ),
        )

        token = at.to_jwt()
        logger.info("Token issued for room=%s voice=%s mode=%s language=%s", room, voice, mode, language)
        return {"token": token, "room": room}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
