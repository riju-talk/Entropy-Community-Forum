"""
Quiz generation endpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class QuizRequest(BaseModel):
    topic: str
    numQuestions: Optional[int] = 5
    difficulty: Optional[str] = "medium"
    customPrompt: Optional[str] = None


# Try to import available generators (prefer groq_service, then langchain_service)
try:
    from app.services.groq_service import groq_service as groq_gen
except Exception:
    groq_gen = None

try:
    from app.services.langchain_service import langchain_service as lc_gen
except Exception:
    lc_gen = None


@router.post("/", response_model=Dict[str, List[Dict[str, Any]]])
async def generate_quiz(payload: QuizRequest):
    """
    Generate quiz questions and return JSON array.
    Tries groq_service -> langchain_service -> fallback sample.
    Response shape: { "questions": [ { question, options, correctAnswer, explanation }, ... ] }
    """
    try:
        topic = payload.topic
        n = max(1, int(payload.numQuestions or 5))
        diff = payload.difficulty or "medium"
        prompt = payload.customPrompt

        questions = []

        # Prefer groq_service
        if groq_gen and hasattr(groq_gen, "generate_quiz"):
            logger.info("Using groq_service.generate_quiz")
            try:
                questions = await groq_gen.generate_quiz(topic, num_questions=n, difficulty=diff, custom_prompt=prompt)
            except Exception as e:
                logger.warning(f"groq_service failed: {e}")
                questions = []
        # Fallback to langchain_service if available
        if (not questions or questions is None) and lc_gen and hasattr(lc_gen, "generate_quiz"):
            logger.info("Using langchain_service.generate_quiz")
            try:
                questions = await lc_gen.generate_quiz(topic, num_questions=n, difficulty=diff, custom_prompt=prompt)
            except Exception as e:
                logger.warning(f"langchain_service.generate_quiz failed: {e}")
                questions = []

        # Final fallback - deterministic sample questions
        if not questions:
            logger.info("Falling back to sample quiz generator")
            sample_opts = [
                ["Option A", "Option B", "Option C", "Option D"],
                ["True", "False", "Maybe", "Depends"],
            ]
            for i in range(n):
                questions.append({
                    "question": f"Sample question {i+1} about {topic} (difficulty: {diff})?",
                    "options": sample_opts[i % len(sample_opts)],
                    "correctAnswer": 0,
                    "explanation": "This is a sample explanation. Replace with LLM output."
                })

        # Ensure each question has required fields and exactly 4 options
        normalized = []
        for q in questions:
            opts = q.get("options") or q.get("choices") or []
            # normalize options to array of strings, pad or trim to 4
            opts = [str(o) for o in opts][:4]
            while len(opts) < 4:
                opts.append("None of the above")
            normalized.append({
                "question": str(q.get("question") or q.get("prompt") or "Question"),
                "options": opts,
                "correctAnswer": int(q.get("correctAnswer", 0)),
                "explanation": str(q.get("explanation", "")),
            })

        return {"questions": normalized}

    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
