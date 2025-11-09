"""
Flashcard generation endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class FlashcardRequest(BaseModel):
    topic: str
    count: Optional[int] = 10
    customPrompt: Optional[str] = None


# Try to import available generators
try:
    from app.services.groq_service import groq_service as groq_gen
except Exception:
    groq_gen = None

try:
    from app.services.langchain_service import langchain_service as lc_gen
except Exception:
    lc_gen = None


@router.post("/", response_model=Dict[str, Any])
async def generate_flashcards(payload: FlashcardRequest):
    """
    Generate flashcards - BETA VERSION
    Returns: { "flashcards": [...], "version": "beta", "count": N }
    """
    try:
        topic = payload.topic
        count = max(1, min(int(payload.count or 10), 50))  # Cap at 50
        prompt = payload.customPrompt

        cards = []

        # Try groq_service
        if groq_gen and hasattr(groq_gen, "generate_flashcards"):
            logger.info(f"Using groq_service for {count} flashcards")
            try:
                cards = await groq_gen.generate_flashcards(topic, count=count, custom_prompt=prompt)
            except Exception as e:
                logger.warning(f"groq_service failed: {e}")

        # Fallback to langchain_service
        if (not cards or len(cards) < count) and lc_gen:
            logger.info("Trying langchain_service fallback")
            try:
                if hasattr(lc_gen, "generate_flashcards"):
                    cards = await lc_gen.generate_flashcards(topic, count=count, custom_prompt=prompt)
            except Exception as e:
                logger.warning(f"langchain fallback failed: {e}")

        # Deterministic fallback
        if not cards or len(cards) < count:
            logger.info("Using beta fallback flashcards")
            cards = []
            for i in range(count):
                cards.append({
                    "front": f"{topic} - Concept {i+1}",
                    "back": f"Beta version: Explanation for concept {i+1} related to {topic}"
                })

        # Normalize
        normalized = []
        for c in cards[:count]:
            normalized.append({
                "front": str(c.get("front", c.get("question", ""))),
                "back": str(c.get("back", c.get("answer", "")))
            })
        
        # Ensure exact count
        while len(normalized) < count:
            idx = len(normalized)
            normalized.append({
                "front": f"{topic} - Key Point {idx+1}",
                "back": f"Beta: Explanation for point {idx+1}"
            })

        logger.info(f"✅ Returning {len(normalized)} flashcards (BETA)")
        return {
            "flashcards": normalized[:count],
            "version": "beta",
            "count": len(normalized[:count]),
            "note": "Beta version - AI-generated content may need review"
        }

    except Exception as e:
        logger.error(f"Flashcard generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Beta version error: {str(e)}")
