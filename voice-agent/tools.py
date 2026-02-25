"""
Shared tool execution for Clarte. Used by both the LiveKit agent and the WebSocket relay.
"""
import logging
import os

from exa_py import Exa

logger = logging.getLogger(__name__)


def do_search_web(query: str) -> str:
    """Search Exa and return results as plain text."""
    api_key = os.getenv("EXA_API_KEY")
    if not api_key:
        return "EXA_API_KEY is not configured."
    exa = Exa(api_key=api_key)
    try:
        response = exa.search_and_contents(query, text=True, num_results=4)
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
        parts.append(
            f"[{i}] {title}\nURL: {url}\n{(text[:600] + '...') if len(text) > 600 else text}"
        )
    return "\n\n---\n\n".join(parts)


def do_check_schedule(query: str) -> str:
    """Check availability and propose times. Stub until calendar integration."""
    logger.info("check_schedule: %s", query[:80] if query else "")
    return (
        "Calendar integration is not yet configured. "
        "For now, I can't check your availability or move events. "
        "Tell me what you need and I'll note it for when the integration is ready."
    )


def do_log_feedback(content: str, project: str = "") -> str:
    """Log feedback/notes to memory. Stub until Notion/DB integration."""
    logger.info("log_feedback: project=%s content=%s", project[:40] if project else "", content[:80] if content else "")
    return (
        "Memory integration is not yet configured. "
        "I've noted that internally for this session. "
        "For persistent storage, we'll need to connect a database like Notion."
    )
