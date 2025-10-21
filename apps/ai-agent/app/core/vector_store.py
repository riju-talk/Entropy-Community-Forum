"""
Vector Store Integration (ChromaDB)
"""

from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from typing import Optional

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

_vector_store: Optional[Chroma] = None

def init_vector_store() -> Chroma:
    """
    Initialize ChromaDB vector store
    """
    global _vector_store

    if _vector_store is not None:
        return _vector_store

    try:
        logger.info("Initializing ChromaDB vector store...")

        # Initialize embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        # Initialize ChromaDB
        _vector_store = Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=embeddings,
            collection_name="spark_documents"
        )

        logger.info("ChromaDB vector store initialized successfully")
        return _vector_store

    except Exception as e:
        logger.error(f"Failed to initialize vector store: {str(e)}", exc_info=True)
        raise

def get_vector_store() -> Chroma:
    """
    Get the vector store instance
    """
    if _vector_store is None:
        return init_vector_store()
    return _vector_store
