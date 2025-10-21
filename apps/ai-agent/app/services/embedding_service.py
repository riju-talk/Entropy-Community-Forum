"""
Text Embedding Service
Provides text-to-vector conversion
"""

from sentence_transformers import SentenceTransformer
from functools import lru_cache
import numpy as np

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class EmbeddingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        self._initialized = True
        logger.info("Embedding model loaded successfully")

    def encode(self, text: str) -> np.ndarray:
        """Generate embedding for text"""
        return self.model.encode(text, convert_to_numpy=True)

    def encode_batch(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for multiple texts"""
        return self.model.encode(texts, convert_to_numpy=True)

    def similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        emb1 = self.encode(text1)
        emb2 = self.encode(text2)
        return np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

@lru_cache()
def get_embedding_service() -> EmbeddingService:
    """Get singleton embedding service instance"""
    return EmbeddingService()
