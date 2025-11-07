"""
LLM Client Wrapper using Groq (FREE)
"""
from groq import Groq
from typing import Optional
import os

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

_llm_instance: Optional[Groq] = None

def get_llm() -> Groq:
    """
    Get LLM instance (Groq client)
    """
    global _llm_instance

    if _llm_instance is None:
        logger.info(f"Initializing Groq LLM: {settings.LLM_MODEL}")
        
        api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        _llm_instance = Groq(api_key=api_key)

        logger.info("Groq LLM initialized successfully")

    return _llm_instance

async def generate_response(
    prompt: str,
    system_prompt: str = "You are a helpful AI tutor.",
    max_tokens: int = None,
    temperature: float = None
) -> str:
    """Generate response using Groq"""
    llm = get_llm()
    
    max_tokens = max_tokens or settings.LLM_MAX_TOKENS
    temperature = temperature or settings.LLM_TEMPERATURE
    
    try:
        chat_completion = llm.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            model=settings.LLM_MODEL,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return chat_completion.choices[0].message.content.strip()
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
