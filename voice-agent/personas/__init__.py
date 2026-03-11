"""
Clarte persona system: mode-specific prompt addons and detection.
Personas: thinking, advice, psychological, motivated, soft.
"""
from personas.base import Persona
from personas.registry import get_persona, detect_persona, PERSONA_IDS, get_all_personas

__all__ = [
    "Persona",
    "get_persona",
    "detect_persona",
    "PERSONA_IDS",
    "get_all_personas",
]
