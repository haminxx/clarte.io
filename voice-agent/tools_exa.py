"""
RESEARCH SKILL: Handles Exa API calls for topics not in local memory.
Uses Fast Search for ~400ms latency; call only when local DB returns Unknown.
"""
import os

from exa_py import Exa


def get_exa_client() -> Exa:
    key = os.getenv("EXA_API_KEY")
    if not key:
        raise ValueError("EXA_API_KEY is required for research_topic")
    return Exa(api_key=key)


def research_topic(query: str, num_results: int = 1, max_text_len: int = 500) -> str:
    """
    Called when the user asks about a topic we don't know locally.
    Uses Exa 'neural' search; keep num_results=1 and minimal content for speed.
    """
    exa = get_exa_client()
    # search_and_contents: single call for search + content; text=True for snippet
    result = exa.search_and_contents(
        query,
        type="neural",
        use_autoprompt=True,
        num_results=num_results,
        text=True,
    )
    if not result.results:
        return "No results found."
    text = (result.results[0].text or "")[:max_text_len]
    return f"Research data: {text}" if text else "No content returned."
