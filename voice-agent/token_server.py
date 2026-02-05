"""
Token server: issues LiveKit access tokens for the frontend.
Run with: uvicorn token_server:app --host 0.0.0.0 --port 8080
Frontend calls GET /token?room=xxx&identity=yyy to get a JWT.
"""
import os
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# LiveKit API key/secret (same as agent)
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # cleanup if any


app = FastAPI(title="Clarte Voice Token Server", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_token(room: str, identity: str) -> str:
    from livekit.api import AccessToken, VideoGrants

    token = AccessToken(api_key=LIVEKIT_API_KEY, api_secret=LIVEKIT_API_SECRET)
    token.with_identity(identity).with_grants(
        VideoGrants(room_join=True, room=room, can_publish=True, can_subscribe=True)
    )
    return token.to_jwt()


@app.get("/token")
def get_token(room: str | None = None, identity: str | None = None):
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(status_code=503, detail="LiveKit API key/secret not configured")
    room = room or f"clarte-{uuid.uuid4().hex[:12]}"
    identity = identity or f"user-{uuid.uuid4().hex[:8]}"
    jwt = create_token(room=room, identity=identity)
    return {"token": jwt, "room": room}
