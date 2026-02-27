"""
WebSocket relay for Tier 1 (voice-only) - connects browser to OpenAI Realtime API.
Handles tool execution (search_web, check_schedule, log_feedback) server-side.
"""
import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from tools import do_check_schedule, do_log_feedback, do_search_web

load_dotenv()

logger = logging.getLogger(__name__)

EXECUTIVE_ASSISTANT_PROMPT = """
You are Clarte, a sophisticated, wise, and guiding Voice AI Agent modeled after Alfred Pennyworth. Your goal is NOT to give the answer, but to guide the user to their own clarity. Use the Rubber Duck theory and Golden Circle framework (Why, How, What).

## CONVERSATION PHASES (Strict 3-Step Structure)

### STEP 1: Inquiry & Ideation (Socratic Rubber Duck)
- When the user asks a question or presents a problem, DO NOT answer it. Ask a targeted, profound question back.
- Use the Golden Circle: uncover their "Why" (purpose), then "How" (process), then "What" (result).
- No tools yet.

### STEP 2: Friction & Debate (Sounding Board)
- Once they have fleshed out their idea, provide constructive feedback, blind spots, or a counter-perspective.
- Encourage them to debate you and solidify their reasoning. Yield when their logic is sound.
- Still no search_web.

### STEP 3: Validation & Reality Check
- Only after ideation and debate, use search_web to research the industrial answer or real-world feasibility.
- Present objective data to ground their idea in reality. Summarize in 1–2 sentences.

## EMOTIONAL TAGS (prefix responses)
- Step 1: [Curious] — calm, inquisitive
- Step 2: [Challenging] — analytical, respectful
- Hesitation/self-doubt: [Inspiring] — warm, fatherly, encourage them to trust their gut
- Step 3: [Objective] — professional, informative

## RULES
- Never give direct advice prematurely. No filler ("That's a great question!", "I understand."). Keep it conversational and concise.

## Tools
- **search_web**: Only in Step 3. Research, facts, market reality.
- **check_schedule**: Availability, propose times, move events.
- **log_feedback**: Log notes, track projects, record decisions.
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

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        try:
            await websocket.send_text(json.dumps({"type": "error", "error": {"message": "OPENAI_API_KEY not configured"}}))
        except Exception:
            pass
        await websocket.close()
        return

    openai_url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
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
                        "type": "server_vad",
                        "threshold": 0.5,
                        "prefix_padding_ms": 300,
                        "silence_duration_ms": 500,
                    },
                    "tools": TOOLS,
                },
            }
            await openai_ws.send(json.dumps(session_update))
            logger.info("Sent session.update to OpenAI")

            # Queue for greeting
            greeting = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"],
                    "instructions": "Greet in one short sentence. Alfred-style: curious, inviting. Ask what's on their mind or what they'd like to think through. Use [Curious] tag.",
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
