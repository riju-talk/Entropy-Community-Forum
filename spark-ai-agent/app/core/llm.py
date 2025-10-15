"""
LLM Client Wrapper
"""

from langchain.chat_models import ChatOpenAI
from typing import Optional

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

_llm_instance: Optional[ChatOpenAI] = None

def get_llm() -> ChatOpenAI:
    """
    Get LLM instance
    """
    global _llm_instance

    if _llm_instance is None:
        logger.info(f"Initializing LLM: {settings.LLM_MODEL}")

        _llm_instance = ChatOpenAI(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.LLM_MAX_TOKENS,
            openai_api_key=settings.OPENAI_API_KEY
        )

        logger.info("LLM initialized successfully")

    return _llm_instance
