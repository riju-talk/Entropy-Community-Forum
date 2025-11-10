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
    customPrompt: Optional[str] = None  # Accept customPrompt from frontend


# Import groq_service
try:
    from app.services.groq_service import groq_service
    logger.info("✅ groq_service imported for flashcard generation")
except Exception as e:
    logger.error(f"❌ Failed to import groq_service: {e}")
    groq_service = None


@router.post("/")  # removed: dependencies=[Depends(verify_secret)]
async def generate_flashcards(payload: FlashcardRequest):
    """
    Generate flashcards - PUBLIC endpoint (no shared-secret auth).
    """
    if not groq_service:
        logger.error("groq_service not available")
        raise HTTPException(
            status_code=503,
            detail="Flashcard generation service unavailable. Check server logs."
        )
    
    try:
        topic = payload.topic.strip()
        if not topic:
            raise HTTPException(status_code=400, detail="Topic cannot be empty")
        
        count = max(1, min(int(payload.count or 10), 50))
        custom_prompt = payload.customPrompt  # Extract customPrompt
        
        logger.info(f"Generating {count} flashcards for topic: {topic}")
        if custom_prompt:
            logger.info(f"Using custom prompt: {custom_prompt[:100]}...")
        
        # Call groq_service with custom_prompt
        flashcards = await groq_service.generate_flashcards(
            topic=topic,
            count=count,
            custom_prompt=custom_prompt  # Pass to groq_service
        )
        
        if not flashcards or len(flashcards) == 0:
            logger.error("LLM returned no flashcards")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate flashcards. LLM returned empty response."
            )
        
        # Normalize structure
        normalized = []
        for card in flashcards:
            front = card.get("front", card.get("question", ""))
            back = card.get("back", card.get("answer", ""))
            
            if not front or not back:
                logger.warning(f"Skipping invalid flashcard: {card}")
                continue
            
            normalized.append({
                "front": str(front),
                "back": str(back)
            })
        
        if not normalized:
            raise HTTPException(
                status_code=500,
                detail="All generated flashcards were invalid. Please try again."
            )
        
        logger.info(f"✅ Successfully generated {len(normalized)} flashcards")
        return {
            "flashcards": normalized,
            "count": len(normalized)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Flashcard generation error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Flashcard generation failed: {str(e)}"
        )
