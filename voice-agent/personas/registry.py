"""
Persona registry: detect persona from recent messages and return prompt addon.
"""
import logging
from typing import List

from personas.base import Persona
from personas.thinking import THINKING
from personas.advice import ADVICE
from personas.psychological import PSYCHOLOGICAL
from personas.motivated import MOTIVATED
from personas.soft import SOFT

logger = logging.getLogger(__name__)

PERSONA_IDS = ["thinking", "advice", "psychological", "motivated", "soft"]

_ALL: List[Persona] = [THINKING, ADVICE, PSYCHOLOGICAL, MOTIVATED, SOFT]


def get_all_personas() -> List[Persona]:
    return list(_ALL)


def get_persona(name: str) -> Persona | None:
    for p in _ALL:
        if p.name == name:
            return p
    return None


def detect_persona(recent_messages: List[str]) -> str:
    """
    Infer persona from recent user messages (e.g. last 3–5).
    Returns persona name (e.g. "thinking", "psychological").
    Default: "thinking" if no strong match.
    """
    if not recent_messages:
        return "thinking"
    combined = " ".join(recent_messages)
    best: Persona | None = None
    best_count = 0
    for persona in _ALL:
        count = sum(1 for t in persona.triggers if t.lower() in combined.lower())
        if count > best_count:
            best_count = count
            best = persona
    if best is not None:
        logger.debug("detect_persona: %s (matches=%d)", best.name, best_count)
        return best.name
    return "thinking"
