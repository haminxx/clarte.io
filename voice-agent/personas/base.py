"""
Base persona interface: name, prompt addon, triggers, style hints.
"""
from dataclasses import dataclass
from typing import List


@dataclass
class Persona:
    """A single persona (mode) with system prompt addon and optional triggers."""

    name: str
    prompt_addon: str
    triggers: List[str]
    style_hints: List[str]

    def matches(self, text: str) -> bool:
        """Return True if any trigger keyword appears in text (case-insensitive)."""
        if not text or not self.triggers:
            return False
        lower = text.lower()
        return any(t.lower() in lower for t in self.triggers)
