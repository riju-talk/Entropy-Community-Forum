"""
Mind map generation endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class MindmapRequest(BaseModel):
    topic: str
    diagramType: str = "mindmap"


class MindmapResponse(BaseModel):
    mermaidCode: str


@router.post("/", response_model=MindmapResponse)
async def generate_mindmap(request: MindmapRequest):
    """Generate mind map"""
    try:
        # TODO: Implement actual mindmap generation with Groq
        sample_mermaid = f"""mindmap
  root(({request.topic}))
    Concept 1
    Concept 2
    Concept 3
"""
        return MindmapResponse(mermaidCode=sample_mermaid)
    except Exception as e:
        logger.error(f"Mindmap generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
