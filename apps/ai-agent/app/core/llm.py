from langchain_groq import ChatGroq
from typing import Optional
import os

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

_llm_instance: Optional[ChatGroq] = None


def get_llm() -> ChatGroq:
    """
    Get LLM instance (Groq client)
    """
    global _llm_instance

    if _llm_instance is None:
        logger.info(f"Initializing Groq LLM: {settings.LLM_MODEL}")
        
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if not api_key or not settings.LLM_MODEL:
            raise ValueError("GROQ_API_KEY or LLM_MODEL is missing in the configuration")

        _llm_instance = ChatGroq(api_key=api_key, model=settings.LLM_MODEL)
        logger.info("Groq LLM initialized successfully")

    return _llm_instance


async def generate_response(
    prompt: str,
    system_prompt: str = "You are a helpful AI tutor.",
    max_tokens: int = None,
    temperature: float = None
) -> str:
    llm = get_llm()  # ChatGroq instance configured earlier

    # Build messages list
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": prompt}
    ]

    try:
        output = await llm.ainvoke(messages)   # <-- THE ONLY VALID METHOD CALL
        return output.content.strip()

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise Exception(f"Failed to generate response: {str(e)}")



async def generate_with_context(
    question: str,
    context: str,
    system_prompt: str = "You are a helpful AI tutor."
) -> str:
    """Generate response with context (for RAG)"""
    prompt = f"""Context information:
{context}

Question: {question}

Answer the question based on the context provided above. If the context doesn't contain enough information, provide the best answer you can and mention that additional context would be helpful."""
    
    return await generate_response(prompt, system_prompt)
