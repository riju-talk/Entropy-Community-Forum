"""
FastAPI route for mindmap generation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.mindmap_service import mindmap_service

router = APIRouter()


class MindmapRequest(BaseModel):
    topic: str
    diagram_type: Optional[str] = "mindmap"
    detail_level: Optional[int] = 3
    research: Optional[bool] = True
    systemPrompt: Optional[str] = None


@router.post("/")
async def generate_mindmap(req: MindmapRequest):
    if not req.topic:
        raise HTTPException(status_code=400, detail="Topic is required")

    try:
        code = await mindmap_service.generate(
            topic=req.topic,
            diagram_type=req.diagram_type,
            detail_level=req.detail_level,
            research=req.research,
            custom_prompt=req.systemPrompt
        )

        return {
            "mermaid_code": code,
            "diagram_type": req.diagram_type,
            "detail_level": req.detail_level,
            "research_used": req.research,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
