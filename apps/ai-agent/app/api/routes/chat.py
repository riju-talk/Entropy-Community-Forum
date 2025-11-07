"""
DEPRECATED: Chat endpoint - use /api/qa instead for better RAG support
This file is kept for backward compatibility only
"""
from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

logger.warning("⚠️  chat.py routes are DEPRECATED - please use /api/qa endpoint")


@router.get("/greeting")
async def get_greeting():
    """Redirect to QA greeting"""
    logger.info("Chat greeting called - redirecting to QA")
    from app.api.routes.qa import get_greeting as qa_greeting
    return await qa_greeting()


@router.get("/")
async def chat_info():
    """Information about deprecated endpoint"""
    return {
        "status": "deprecated",
        "message": "This endpoint is deprecated. Please use /api/qa instead.",
        "new_endpoint": "/api/qa",
        "documentation": "/docs"
    }


@router.get("/health")
async def chat_health():
    """Health check"""
    return {
        "status": "deprecated",
        "endpoint": "chat",
        "use_instead": "/api/qa"
    }
