"""
Mind Map Generation Router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os

from app.core.llm import generate_response
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()

class MindMapRequest(BaseModel):
    user_id: str
    topic: str
    depth: int = 3
    style: str = "hierarchical"
    diagram_type: str = "mindmap"  # mindmap or flowchart

@router.post("/mindmap")
async def generate_mindmap(request: MindMapRequest):
    """Generate mind map or flowchart in Mermaid syntax - REQUIRES AUTH"""
    try:
        logger.info(f"Mind map request: {request.topic} by user {request.user_id}")

        # Validate diagram type
        if request.diagram_type not in ["mindmap", "flowchart"]:
            raise HTTPException(status_code=400, detail="Invalid diagram type")

        # Generate Mermaid code
        prompt = f"""Create a {request.style} {request.diagram_type} for the topic: {request.topic}
Depth: {request.depth} levels

Generate a Mermaid diagram code that visualizes the concept hierarchy.

For {request.style} style:
- hierarchical: Use flowchart TD (top-down)
- radial: Use mindmap format
- flowchart: Use flowchart LR (left-right) with decision nodes

Include:
- Main concept at center/top
- {request.depth} levels of subconcepts
- Clear relationships
- Key terms and definitions

Output ONLY the Mermaid code, starting with graph/flowchart/mindmap."""

        mermaid_code = await generate_response(
            prompt=prompt,
            system_prompt="You are a diagram expert. Generate only valid Mermaid syntax. Do not include explanations or markdown code blocks.",
            max_tokens=1500
        )

        return {
            "mermaid_code": mermaid_code
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))