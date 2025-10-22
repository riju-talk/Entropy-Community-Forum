"""
Embeddings Service
Provides embedding models and configuration
"""

from typing import Optional
from langchain_huggingface import HuggingFaceEmbeddings
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

_embeddings_instance = None

def get_embeddings():
    """
    Get configured embeddings model instance
    Default to all-MiniLM-L6-v2 for better quality,
    fallback to GPT4All for offline/local use
    """
    global _embeddings_instance

    if _embeddings_instance is not None:
        return _embeddings_instance

    try:
        # Try HuggingFace (sentence-transformers) first
        logger.info(f"Initializing embeddings model: {settings.EMBEDDING_MODEL}")
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        logger.info("Using HuggingFace embeddings (sentence-transformers)")
        return _embeddings_instance

    except Exception as e:
        logger.warning(f"Failed to initialize HuggingFace embeddings: {str(e)}")
        logger.info("Falling back to GPT4All embeddings")
        
        try:
            # Fallback to GPT4All (local, no download needed)
            _embeddings_instance = GPT4AllEmbeddings()
            return _embeddings_instance
        except Exception as e:
            logger.error("Failed to initialize embeddings", exc_info=True)
            raise