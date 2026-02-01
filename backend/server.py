"""
Clarte Backend - Creates Daily rooms and runs the Pipecat bot.
POST /session -> create room + token, start bot, return { room_url, token }.
"""
import asyncio
import os
import time
import uuid
from contextlib import asynccontextmanager

import aiohttp
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pydantic import BaseModel

from bot import run_bot

load_dotenv()

DAILY_API_KEY = os.getenv("DAILY_API_KEY")
DAILY_API_URL = "https://api.daily.co/v1"


class SessionResponse(BaseModel):
    room_url: str
    token: str
    room_name: str


# Background tasks: run bot when a session is created
_bot_tasks: set[asyncio.Task] = set()


async def create_room() -> dict:
    """Create a Daily room via REST API."""
    if not DAILY_API_KEY:
        raise ValueError("DAILY_API_KEY is required")
    name = f"clarte-{uuid.uuid4().hex[:12]}"
    payload = {
        "name": name,
        "properties": {
            "exp": int(time.time()) + 3600,  # 1 hour
            "enable_screenshare": True,
            "enable_chat": False,
        },
    }
    headers = {"Authorization": f"Bearer {DAILY_API_KEY}", "Content-Type": "application/json"}
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{DAILY_API_URL}/rooms", json=payload, headers=headers) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise HTTPException(status_code=resp.status, detail=text)
            return await resp.json()


async def create_meeting_token(room_name: str) -> str:
    """Create a Daily meeting token for the room."""
    if not DAILY_API_KEY:
        raise ValueError("DAILY_API_KEY is required")
    payload = {
        "properties": {
            "room_name": room_name,
            "is_owner": True,
            "enable_screenshare": True,
            "enable_recording": False,
        },
    }
    headers = {"Authorization": f"Bearer {DAILY_API_KEY}", "Content-Type": "application/json"}
    async with aiohttp.ClientSession() as session:
        async with session.post(f"{DAILY_API_URL}/meeting-tokens", json=payload, headers=headers) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise HTTPException(status_code=resp.status, detail=text)
            data = await resp.json()
            return data["token"]




@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    for t in _bot_tasks:
        t.cancel()
    _bot_tasks.clear()


app = FastAPI(title="Clarte Backend", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/session", response_model=SessionResponse)
async def create_session():
    """
    Create a Daily room and meeting token, start the Pipecat bot in the room,
    and return room_url and token for the frontend to join.
    """
    if not DAILY_API_KEY:
        raise HTTPException(status_code=500, detail="DAILY_API_KEY not configured")
    try:
        room_data = await create_room()
        room_url = room_data["url"]
        room_name = room_data["name"]
        token = await create_meeting_token(room_name)

        # Run the bot in a background task (same process)
        task = asyncio.create_task(run_bot(room_url, token))
        _bot_tasks.add(task)
        task.add_done_callback(_bot_tasks.discard)

        return SessionResponse(room_url=room_url, token=token, room_name=room_name)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Session creation failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
