"""
Mind map generation endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)
router = APIRouter()


class MindmapRequest(BaseModel):
    topic: str
    depth: int = 3
    diagramType: str = "mindmap"
    customPrompt: Optional[str] = None
    colorScheme: Optional[str] = "auto"
    studentLevel: Optional[str] = "beginner"


@router.post("/")
async def generate_mindmap(payload: MindmapRequest) -> Dict[str, Any]:
    """
    Generate Mermaid diagram and return { mermaidCode: str, themeVars: dict }
    """
    try:
        from app.services.langchain_service import langchain_service

        if not langchain_service:
            logger.error("LangChain service unavailable")
            raise HTTPException(status_code=503, detail="AI service not available")

        logger.info(f"Generating {payload.diagramType} for topic: {payload.topic}")

        # Call service (returns dict with mermaidCode and themeVars)
        result = await langchain_service.generate_research_mindmap(
            topic=payload.topic,
            depth=payload.depth,
            diagram_type=payload.diagramType,
            custom_prompt=payload.customPrompt,
            color_scheme=payload.colorScheme,
            student_level=payload.studentLevel,
        )

        # Ensure result is dict
        if not isinstance(result, dict):
            result = {"mermaidCode": str(result), "themeVars": {}}

        # Validate mermaidCode exists
        if "mermaidCode" not in result or not result["mermaidCode"]:
            raise ValueError("Empty mermaidCode returned")

        logger.info(f"Successfully generated {len(result['mermaidCode'])} chars of Mermaid code")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mindmap generation error: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
