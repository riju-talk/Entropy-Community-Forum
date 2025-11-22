"""
Quiz Generation Endpoint — Clean Version
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.quiz_service import quiz_service

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    numQuestions: Optional[int] = 5
    difficulty: Optional[str] = "medium"
    customPrompt: Optional[str] = None


@router.post("/")
async def generate_quiz(req: QuizRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    count = max(1, min(req.numQuestions or 5, 50))
    difficulty = req.difficulty.lower().strip()

    try:
        questions = await quiz_service.generate(
            topic=topic,
            num_questions=count,
            difficulty=difficulty,
            custom_prompt=req.customPrompt
        )

        if not questions:
            raise RuntimeError("Empty quiz generated")

        return {"questions": questions, "count": len(questions)}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )
