"""
LOCAL MEMORY: Handles Vector DB lookups for fast-path (<20ms) industry/knowledge.
Uses in-memory Qdrant for speed; loads assets/knowledge_base.json at startup.
"""
import json
import os
from pathlib import Path

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams


def get_client() -> QdrantClient:
    """In-memory Qdrant for minimal latency."""
    return QdrantClient(":memory:")


def load_knowledge_base(path: str | None = None) -> list[dict]:
    """Load industry/knowledge entries from assets/knowledge_base.json."""
    if path is None:
        path = Path(__file__).resolve().parent / "assets" / "knowledge_base.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def init_db(client: QdrantClient, knowledge: list[dict]) -> None:
    """
    Create collection and upsert knowledge entries.
    Uses simple keyword-based vectors (dummy 8-dim for demo); replace with real embeddings for production.
    """
    collection = "industry_knowledge"
    # Minimal vector size for placeholder; use real embedding dim (e.g. 1536) when using OpenAI embeddings
    size = 8
    client.create_collection(
        collection_name=collection,
        vectors_config=VectorParams(size=size, distance=Distance.COSINE),
    )
    points = []
    for i, entry in enumerate(knowledge):
        # Placeholder vector (in production, use embedding model for entry["keywords"] or entry["text"])
        vec = [0.1] * size
        if i < size:
            vec[i % size] = 0.9
        points.append(
            PointStruct(
                id=i,
                vector=vec,
                payload={"text": entry.get("text", ""), "industry": entry.get("industry", ""), "keywords": entry.get("keywords", [])},
            )
        )
    if points:
        client.upsert(collection_name=collection, points=points)


def lookup(client: QdrantClient, keywords: str, top_k: int = 1) -> str:
    """
    Fast path: search local DB by keywords. Returns industry or context string.
    For production, embed keywords and use vector search; here we do simple keyword match.
    """
    collection = "industry_knowledge"
    try:
        # Scored search using a placeholder query vector (same dim as collection)
        results = client.scroll(
            collection_name=collection,
            limit=top_k,
            with_payload=True,
        )
        if not results or not results[0]:
            return "Unknown"
        kw_lower = keywords.lower()
        for point in results[0]:
            payload = point.payload or {}
            kws = payload.get("keywords") or []
            if any(kw_lower in (k or "").lower() for k in kws):
                return payload.get("text") or payload.get("industry") or "Unknown"
        # Default: return first result snippet if no keyword match
        first = results[0][0]
        return (first.payload or {}).get("industry") or (first.payload or {}).get("text") or "Unknown"
    except Exception:
        return "Unknown"
