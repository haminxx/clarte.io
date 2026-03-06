"""
Token server: issues LiveKit access tokens for the frontend.
Run with the agent on Render so the frontend can get a token and join a room.
Also provides /realtime WebSocket for Tier 1 (voice-only, no LiveKit).
POST /conversations/save: save conversation with summary + mindmap to Firestore.
"""
import json
import re
import logging
import os
import uuid
from typing import Any, Optional

logger = logging.getLogger(__name__)

from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException, Header, WebSocket
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

VALID_VOICES = frozenset(
    {
        # Legacy OpenAI Realtime voice IDs (kept for backward compatibility)
        "alloy",
        "ash",
        "ballad",
        "coral",
        "echo",
        "marin",
        "sage",
        "shimmer",
        "verse",
        "cedar",
        # Simple personas for Deepgram mapping
        "female",
        "male",
    }
)


VALID_MODES = frozenset({"casual", "expert", "research"})
VALID_LANGUAGES = frozenset({"en", "ko", "es", "zh", "ja", "hi"})

VALID_PERSONAS = frozenset({"female", "male"})


class TokenRequest(BaseModel):
    identity: Optional[str] = None
    room_name: Optional[str] = None
    voice: Optional[str] = None
    mode: Optional[str] = None
    language: Optional[str] = None
    user_name: Optional[str] = None
    voice_profile_id: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/token/debug")
def token_debug():
    """Return which env vars are set (for debugging config). Does not reveal keys."""
    return {
        "livekit_ok": bool(LIVEKIT_API_KEY and LIVEKIT_API_SECRET),
        "openai_set": bool((os.getenv("OPENAI_API_KEY") or "").strip()),
        "deepgram_set": bool((os.getenv("DEEPGRAM_API_KEY") or "").strip()),
    }


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
    # Allow either known persona/legacy IDs or full Deepgram model IDs (e.g. aura-2-thalia-en).
    voice = raw_voice
    if raw_voice not in VALID_VOICES and not str(raw_voice).startswith("aura-"):
        voice = "marin"
    raw_mode = (body.mode if body else None) or "expert"
    mode = raw_mode if raw_mode in VALID_MODES else "expert"
    raw_language = (body.language if body else None) or "en"
    language = raw_language if raw_language in VALID_LANGUAGES else "en"

    raw_name = (body.user_name if body else None)
    user_name = None
    if raw_name and isinstance(raw_name, str):
        v = raw_name.strip()
        if v and v.lower() not in ("undefined", "null"):
            if not v.startswith("user-") and len(v) >= 2 and not re.match(r"^[a-z0-9]{8,36}$", v):
                user_name = v

    voice_profile_id = (body.voice_profile_id if body else None) or None
    if voice_profile_id and (not isinstance(voice_profile_id, str) or len(voice_profile_id.strip()) < 3):
        voice_profile_id = None

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
        meta = {"voice": voice, "mode": mode, "language": language}
        if user_name:
            meta["user_name"] = user_name
        if voice_profile_id:
            meta["voice_profile_id"] = voice_profile_id
        at.with_room_config(
            RoomConfiguration(
                agents=[
                    RoomAgentDispatch(
                        agent_name="clarte",
                        metadata=json.dumps(meta),
                    )
                ],
            ),
        )

        token = at.to_jwt()
        logger.info("Token issued for room=%s voice=%s mode=%s language=%s", room, voice, mode, language)
        return {"token": token, "room": room}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SaveConversationRequest(BaseModel):
    user_id: str
    transcript: list[dict[str, str]] = []
    room_name: Optional[str] = None


class VoiceProfileBase(BaseModel):
    name: str
    deepgram_model: str
    language: Optional[str] = None
    persona: Optional[str] = None
    description: Optional[str] = None


class VoiceProfileCreate(VoiceProfileBase):
    pass


class VoiceProfileUpdate(BaseModel):
    name: Optional[str] = None
    deepgram_model: Optional[str] = None
    language: Optional[str] = None
    persona: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


def _get_firebase_admin():
    """Lazy-init Firebase Admin. Returns None if not configured."""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        try:
            firebase_admin.get_app()
        except ValueError:
            cred_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")
            if cred_json:
                cred = credentials.Certificate(json.loads(cred_json))
                firebase_admin.initialize_app(cred)
            else:
                return None
        return firebase_admin
    except Exception as e:
        logger.debug("Firebase Admin not available: %s", e)
        return None


def _verify_firebase_token(token: str) -> Optional[str]:
    """Verify Firebase ID token, return uid or None."""
    try:
        import firebase_admin
        from firebase_admin import auth

        admin = _get_firebase_admin()
        if not admin:
            return None
        decoded = auth.verify_id_token(token)
        return decoded.get("uid")
    except Exception as e:
        logger.debug("Token verification failed: %s", e)
        return None


def _get_firestore_client():
    admin = _get_firebase_admin()
    if not admin:
        return None
    try:
        from firebase_admin import firestore
        return firestore.client()
    except Exception as e:
        logger.debug("Firestore client not available: %s", e)
        return None


def _serialize_voice_profile(doc) -> dict:
    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data


@app.get("/voice-profiles")
def list_voice_profiles(authorization: Optional[str] = Header(None)):
    token = (authorization or "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authorization required")
    uid = _verify_firebase_token(token)
    if not uid:
        raise HTTPException(status_code=403, detail="Unauthorized")
    db = _get_firestore_client()
    if not db:
        raise HTTPException(status_code=503, detail="Firebase not configured for voice profiles")
    try:
        docs = db.collection("voiceProfiles").where("user_id", "==", uid).stream()
        out = [_serialize_voice_profile(d) for d in docs]
        out.sort(key=lambda x: (x.get("created_at") or ""), reverse=True)
        return out
    except Exception as e:
        logger.exception("Failed to list voice profiles: %s", e)
        raise HTTPException(status_code=500, detail="Failed to list voice profiles")


@app.post("/voice-profiles")
def create_voice_profile(body: VoiceProfileCreate, authorization: Optional[str] = Header(None)):
    token = (authorization or "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authorization required")
    uid = _verify_firebase_token(token)
    if not uid:
        raise HTTPException(status_code=403, detail="Unauthorized")
    db = _get_firestore_client()
    if not db:
        raise HTTPException(status_code=503, detail="Firebase not configured for voice profiles")
    name = body.name.strip()
    deepgram_model = body.deepgram_model.strip()
    if not name or not deepgram_model:
        raise HTTPException(status_code=400, detail="name and deepgram_model are required")
    language = (body.language or "").strip().lower() or None
    if language and language not in VALID_LANGUAGES:
        language = None
    persona = (body.persona or "").strip().lower() or None
    if persona and persona not in VALID_PERSONAS:
        persona = None
    description = (body.description or "").strip() or None
    try:
        from firebase_admin.firestore import SERVER_TIMESTAMP
        doc_ref = db.collection("voiceProfiles").document()
        doc_ref.set({
            "user_id": uid,
            "name": name,
            "deepgram_model": deepgram_model,
            "language": language,
            "persona": persona,
            "description": description,
            "status": "ready",
            "created_at": SERVER_TIMESTAMP,
            "updated_at": SERVER_TIMESTAMP,
        })
        doc = doc_ref.get()
        logger.info("Created voice profile %s for user %s", doc_ref.id, uid)
        return _serialize_voice_profile(doc)
    except Exception as e:
        logger.exception("Failed to create voice profile: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create voice profile")


@app.get("/voice-profiles/{profile_id}")
def get_voice_profile(profile_id: str, authorization: Optional[str] = Header(None)):
    token = (authorization or "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authorization required")
    uid = _verify_firebase_token(token)
    if not uid:
        raise HTTPException(status_code=403, detail="Unauthorized")
    db = _get_firestore_client()
    if not db:
        raise HTTPException(status_code=503, detail="Firebase not configured for voice profiles")
    try:
        doc_ref = db.collection("voiceProfiles").document(profile_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Voice profile not found")
        data = doc.to_dict() or {}
        if data.get("user_id") != uid:
            raise HTTPException(status_code=403, detail="Unauthorized")
        return _serialize_voice_profile(doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch voice profile %s: %s", profile_id, e)
        raise HTTPException(status_code=500, detail="Failed to fetch voice profile")


@app.patch("/voice-profiles/{profile_id}")
def update_voice_profile(profile_id: str, body: VoiceProfileUpdate, authorization: Optional[str] = Header(None)):
    token = (authorization or "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authorization required")
    uid = _verify_firebase_token(token)
    if not uid:
        raise HTTPException(status_code=403, detail="Unauthorized")
    db = _get_firestore_client()
    if not db:
        raise HTTPException(status_code=503, detail="Firebase not configured for voice profiles")
    try:
        from firebase_admin.firestore import SERVER_TIMESTAMP
        doc_ref = db.collection("voiceProfiles").document(profile_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Voice profile not found")
        current = doc.to_dict() or {}
        if current.get("user_id") != uid:
            raise HTTPException(status_code=403, detail="Unauthorized")
        updates = {"updated_at": SERVER_TIMESTAMP}
        if body.name is not None:
            updates["name"] = body.name.strip()
        if body.deepgram_model is not None:
            updates["deepgram_model"] = body.deepgram_model.strip()
        if body.language is not None:
            lang = body.language.strip().lower() or None
            if lang and lang not in VALID_LANGUAGES:
                lang = None
            updates["language"] = lang
        if body.persona is not None:
            p = body.persona.strip().lower() or None
            if p and p not in VALID_PERSONAS:
                p = None
            updates["persona"] = p
        if body.description is not None:
            updates["description"] = body.description.strip() or None
        if body.status is not None:
            updates["status"] = body.status.strip() or None
        doc_ref.update(updates)
        doc = doc_ref.get()
        logger.info("Updated voice profile %s for user %s", profile_id, uid)
        return _serialize_voice_profile(doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to update voice profile %s: %s", profile_id, e)
        raise HTTPException(status_code=500, detail="Failed to update voice profile")


@app.delete("/voice-profiles/{profile_id}")
def delete_voice_profile(profile_id: str, authorization: Optional[str] = Header(None)):
    token = (authorization or "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authorization required")
    uid = _verify_firebase_token(token)
    if not uid:
        raise HTTPException(status_code=403, detail="Unauthorized")
    db = _get_firestore_client()
    if not db:
        raise HTTPException(status_code=503, detail="Firebase not configured for voice profiles")
    try:
        doc_ref = db.collection("voiceProfiles").document(profile_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Voice profile not found")
        data = doc.to_dict() or {}
        if data.get("user_id") != uid:
            raise HTTPException(status_code=403, detail="Unauthorized")
        doc_ref.delete()
        logger.info("Deleted voice profile %s for user %s", profile_id, uid)
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to delete voice profile %s: %s", profile_id, e)
        raise HTTPException(status_code=500, detail="Failed to delete voice profile")


@app.post("/conversations/save")
def save_conversation(
    body: SaveConversationRequest,
    authorization: Optional[str] = Header(None),
):
    """Save conversation with AI-generated summary and mindmap to Firestore."""
    token = (authorization or "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Authorization required")

    uid = _verify_firebase_token(token)
    if not uid or uid != body.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    transcript_text = (
        "\n\n".join(f"{t.get('role', '')}: {t.get('content', '')}" for t in body.transcript)
        if body.transcript
        else "Voice conversation with Clarte (no transcript available)."
    )

    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise HTTPException(status_code=503, detail="OpenAI not configured")

    try:
        from openai import OpenAI

        client = OpenAI(api_key=openai_key)
    except ImportError:
        raise HTTPException(status_code=503, detail="OpenAI client not available")

    try:
        summary_res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Summarize this conversation in 2-4 sentences. Focus on key topics, decisions, and guidance given.",
                },
                {"role": "user", "content": transcript_text},
            ],
            max_tokens=300,
        )
        summary = (
            summary_res.choices[0].message.content.strip()
            if summary_res.choices
            else "Voice conversation with Clarte."
        )
    except Exception as e:
        logger.exception("Summary generation failed: %s", e)
        raise HTTPException(status_code=500, detail="Summary generation failed")

    mindmap: dict[str, Any] = {"nodes": [], "edges": []}
    try:
        mindmap_res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": 'Generate a mindmap as JSON: { "nodes": [{ "id": "1", "label": "Topic", "type": "topic" }], "edges": [{ "from": "1", "to": "2" }] }. '
                    "Types: topic, question, answer, guidance, change. Return only valid JSON.",
                },
                {"role": "user", "content": transcript_text},
            ],
            max_tokens=500,
        )
        raw = mindmap_res.choices[0].message.content.strip() if mindmap_res.choices else ""
        if raw:
            parsed = json.loads(raw.replace("```json", "").replace("```", "").strip())
            if isinstance(parsed.get("nodes"), list):
                mindmap["nodes"] = [
                    {
                        "id": str(n.get("id", n.get("label", ""))),
                        "label": str(n.get("label", "")),
                        "type": n.get("type", "topic")
                        if n.get("type") in ("topic", "question", "answer", "guidance", "change")
                        else "topic",
                    }
                    for n in parsed["nodes"]
                ]
            if isinstance(parsed.get("edges"), list):
                mindmap["edges"] = [
                    {"from": str(e.get("from", "")), "to": str(e.get("to", ""))}
                    for e in parsed["edges"]
                ]
    except Exception as e:
        logger.debug("Mindmap generation failed (non-fatal): %s", e)

    admin = _get_firebase_admin()
    if not admin:
        raise HTTPException(status_code=503, detail="Firebase not configured for save")

    try:
        from firebase_admin import firestore
        from firebase_admin.firestore import SERVER_TIMESTAMP

        db = firestore.client()
        doc_ref = db.collection("conversations").document()
        title = (summary[:80] + "…") if len(summary) > 80 else summary
        doc_ref.set(
            {
                "user_id": body.user_id,
                "title": title,
                "summary": summary,
                "mindmap": mindmap,
                "updated_at": SERVER_TIMESTAMP,
                "created_at": SERVER_TIMESTAMP,
            }
        )
        logger.info("Saved conversation %s for user %s", doc_ref.id, body.user_id)
        return {"id": doc_ref.id}
    except Exception as e:
        logger.exception("Firestore save failed: %s", e)
        raise HTTPException(status_code=500, detail="Save failed")
