"""
WebSocket relay for Tier 1 (voice-only) - connects browser to OpenAI Realtime API.
Handles tool execution (search_web, check_schedule, log_feedback) server-side.
"""
import asyncio
import json
import re
import logging
import os
import random
from typing import Optional
from urllib.parse import parse_qs

from dotenv import load_dotenv
from tools import do_check_schedule, do_log_feedback, do_search_web

load_dotenv()

logger = logging.getLogger(__name__)

EXECUTIVE_ASSISTANT_PROMPT = """
You are Clarte, an Alfred-style Voice AI: guide users to their own clarity using the Rubber Duck theory and Golden Circle (Why, How, What). Never give direct advice prematurely.

## 3-STEP STRUCTURE (strict order)
**Step 1 – Inquiry:** Don't answer; ask back. Uncover Why → How → What. No tools.
**Step 2 – Debate:** Give feedback, blind spots, counter-perspective. User defends. No search_web.
**Step 3 – Reality Check:** Only then use search_web for industrial answer. Say "Let me look that up" briefly; summarize in 1–2 sentences.

## EMOTIONAL TAGS (prefix responses)
[Curious] Step 1 – calm, inquisitive. [Challenging] Step 2 – analytical, respectful. [Inspiring] When user hesitates despite clear plan – warm, fatherly, quote wisdom, trust your gut. [Objective] Step 3 – professional.

## CONTEXT-AWARE HELP (when user requests specific assistance)

**Translation (e.g. "translate what you see on my screen to Korean"):**
- If they share screen/camera: Use request_screen_share or request_camera first. Once you receive the visual context, provide a complete (100%) translation. Match their requested target language.
- If they read the text aloud: Translate exactly what they said, in full.
- If the user asks you to translate what is on their screen, first request screen share. If you receive visual input, translate it fully. If not, ask them to read the relevant text aloud and translate exactly what they say.

**Math / homework / studying:**
- Default: Give only the first step or hint. Then suggest how they should approach the next step. Do not give the full answer unless they clearly struggle.
- Use show_guidance for step-by-step visual hints when helpful.

**Genuine understanding difficulty:**
- If the user expresses confusion, says they don't understand the material, or has tried and failed: Provide a full step-by-step explanation. Use show_guidance for math/equations.
- After explaining, ask a follow-up: either an example question they can try, or a question about the problem-solving order to confirm they understood.
- Example: "Does that order make sense? What would you do first if I gave you a similar problem?"

## RULES
No premature advice. No filler. 1–2 sentences max. Don't repeat what the user said. Exception: briefly restate only when confirming complex conclusions. Match user language.

## SPEECH & DELIVERY
Vary your pacing naturally in your written responses: sometimes start with a quick burst, slow down for emphasis, pause briefly (use ellipsis or short phrasing). Avoid robotic, uniform rhythm. Your text will be spoken by TTS – varied sentence length and structure produce more natural-sounding speech.

## CONVERSATION PHASING

**Initial / casual (no clear topic):** When the user is unsure what to talk about or gives a vague opener, keep it light. Ask: "What have you done today?" or "What are you planning to do today?" or similar. One casual question. Do not dive into deep inquiry yet.

**Topic-focused (clear subject):** When the user names a specific topic (business, research, homework, industry, etc.), switch to deeper inquiry. Ask sharp, targeted questions related to that domain. Use the 3-step structure (Why → How → What) within that context.

**Stay quiet / hold:** If the user asks you to stay quiet, stay on hold, wait, or similar – acknowledge briefly (e.g. "I'll wait.") and remain silent until they speak again. Do not ask follow-up questions until they re-engage.

## Tools
search_web: Step 3 only. check_schedule: availability. log_feedback: notes.
"""

TOOLS = [
    {
        "type": "function",
        "name": "search_web",
        "description": "Search the web for research, news, facts, or detailed information. Use when the user needs external data to inform a decision.",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query"}},
            "required": ["query"],
        },
    },
    {
        "type": "function",
        "name": "check_schedule",
        "description": "Check the boss's calendar availability. Use when they ask about free slots, propose meeting times, or need to move/reschedule events.",
        "parameters": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "What to check (e.g. 'next week', 'tomorrow afternoon')"}},
            "required": ["query"],
        },
    },
    {
        "type": "function",
        "name": "log_feedback",
        "description": "Log a note, track project progress, or record a decision for future recall. Use when the user wants to save something for later.",
        "parameters": {
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Content to log"},
                "project": {"type": "string", "description": "Optional project name", "default": ""},
            },
            "required": ["content"],
        },
    },
]

FOLLOW_UP_PHRASES_EN = [
    "What's on your mind lately?",
    "What have you been up to today?",
    "What are you planning to do today?",
    "How can I help?",
    "Do you need some help?",
    "What would you like to think through today?",
    "What's been occupying your thoughts?",
]
FOLLOW_UP_PHRASES_KO = [
    "오늘 무엇을 함께 생각해 보시겠어요?",
    "오늘 뭐 하셨어요?",
    "오늘 뭐 하실 계획이에요?",
    "어떻게 도와드릴까요?",
    "도움이 필요하신가요?",
    "무엇이 마음에 걸리시나요?",
    "요즘 어떤 생각이 드시나요?",
]


def _is_valid_user_name(name: Optional[str]) -> bool:
    """Reject identity-like or invalid names."""
    if not name or not name.strip():
        return False
    val = name.strip()
    if val.lower() in ("undefined", "null"):
        return False
    if val.startswith("user-") or len(val) < 2:
        return False
    if re.match(r"^[a-z0-9]{8,36}$", val):
        return False
    return True


def _build_greeting_instructions(user_name: Optional[str], language: str) -> str:
    """Build personalized greeting instructions for the relay."""
    valid_name = user_name if _is_valid_user_name(user_name) else None
    if language == "ko":
        opening = f"안녕하세요, {valid_name}님!" if valid_name else "안녕하세요!"
        follow_up = random.choice(FOLLOW_UP_PHRASES_KO)
    else:
        opening = f"Hello, {valid_name}!" if valid_name else "Hello!"
        follow_up = random.choice(FOLLOW_UP_PHRASES_EN)
    return f'Say exactly: "{opening} {follow_up}"'


def _execute_tool(name: str, arguments: str) -> str:
    """Execute a tool and return the result."""
    try:
        args = json.loads(arguments) if arguments else {}
    except json.JSONDecodeError:
        return "Invalid arguments."
    if name == "search_web":
        return do_search_web(args.get("query", ""))
    if name == "check_schedule":
        return do_check_schedule(args.get("query", ""))
    if name == "log_feedback":
        return do_log_feedback(args.get("content", ""), args.get("project", ""))
    return f"Unknown tool: {name}"


async def _run_tool(name: str, arguments: str) -> str:
    """Run tool in thread pool to avoid blocking."""
    return await asyncio.to_thread(_execute_tool, name, arguments)


async def handle_realtime_websocket(websocket):
    """Handle a client WebSocket connection: relay to OpenAI and handle tools."""
    import websockets

    # Parse query params for personalized greeting (e.g. ?user_name=John&language=ko)
    user_name = None
    language = "en"
    try:
        query_string = websocket.scope.get("query_string", b"").decode()
        if query_string:
            params = parse_qs(query_string)
            if params.get("user_name"):
                raw = (params["user_name"][0] or "").strip()
                if raw and raw.lower() not in ("undefined", "null"):
                    if not raw.startswith("user-") and len(raw) >= 2 and not re.match(r"^[a-z0-9]{8,36}$", raw):
                        user_name = raw
            if params.get("language") and params["language"][0] == "ko":
                language = "ko"
    except Exception as e:
        logger.debug("Could not parse WebSocket query params: %s", e)

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        try:
            await websocket.send_text(json.dumps({"type": "error", "error": {"message": "OPENAI_API_KEY not configured"}}))
        except Exception:
            pass
        await websocket.close()
        return

    openai_url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-1.5"
    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        async with websockets.connect(openai_url, extra_headers=headers) as openai_ws:
            # Send session config
            session_update = {
                "type": "session.update",
                "session": {
                    "instructions": EXECUTIVE_ASSISTANT_PROMPT,
                    "voice": "cedar",
                    "turn_detection": {
                        "type": "semantic_vad",
                        "eagerness": "high",
                        "create_response": True,
                        "interrupt_response": True,
                    },
                    "tools": TOOLS,
                },
            }
            await openai_ws.send(json.dumps(session_update))
            logger.info("Sent session.update to OpenAI")

            # Queue for personalized greeting
            greeting_instructions = _build_greeting_instructions(user_name, language)
            greeting = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"],
                    "instructions": greeting_instructions,
                },
            }
            await openai_ws.send(json.dumps(greeting))

            async def forward_to_client():
                try:
                    async for msg in openai_ws:
                        data = json.loads(msg)
                        evt_type = data.get("type", "")
                        item = data.get("item", {})

                        # Handle function_call: execute tool and send output
                        if evt_type == "conversation.item.added" and item.get("type") == "function_call":
                            status = item.get("status", "")
                            if status == "completed":
                                name = item.get("name", "")
                                args = item.get("arguments", "{}")
                                call_id = item.get("call_id", item.get("id", ""))
                                logger.info("Executing tool: %s", name)
                                result = await _run_tool(name, args)
                                output_msg = {
                                    "type": "conversation.item.create",
                                    "item": {
                                        "type": "function_call_output",
                                        "call_id": call_id,
                                        "output": result,
                                    },
                                }
                                await openai_ws.send(json.dumps(output_msg))
                                logger.info("Sent function_call_output for %s", name)

                        await websocket.send_text(msg)
                except websockets.exceptions.ConnectionClosed:
                    pass
                except Exception as e:
                    logger.exception("Error forwarding to client: %s", e)

            async def forward_to_openai():
                try:
                    while True:
                        msg = await websocket.receive_text()
                        data = json.loads(msg)
                        evt_type = data.get("type", "")
                        # Don't forward session.update from client - we already sent ours
                        if evt_type == "session.update":
                            continue
                        await openai_ws.send(msg)
                except Exception as e:
                    logger.exception("Error forwarding to OpenAI: %s", e)

            await asyncio.gather(forward_to_client(), forward_to_openai())
    except Exception as e:
        logger.exception("Realtime relay error: %s", e)
        try:
            await websocket.send_text(json.dumps({"type": "error", "error": {"message": str(e)}}))
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
