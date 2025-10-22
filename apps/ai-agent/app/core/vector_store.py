"""
Vector Store Integration (ChromaDB)
Handles document storage, retrieval, and similarity search
"""

from typing import Optional, List, Dict, Any
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.core.embeddings import get_embeddings
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

_vector_store: Optional[Chroma] = None
_text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.CHUNK_SIZE,
    chunk_overlap=settings.CHUNK_OVERLAP,
    length_function=len,
    add_start_index=True,
)

def init_vector_store() -> Chroma:
    """
    Initialize ChromaDB vector store with configured embeddings
    """
    global _vector_store

    if _vector_store is not None:
        return _vector_store

    try:
        logger.info("Initializing ChromaDB vector store...")
        
        # Get embeddings from service
        embeddings = get_embeddings()

        # Initialize ChromaDB with better config
        _vector_store = Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=embeddings,
            collection_name="spark_documents",
            collection_metadata={
                "description": "Document storage for Spark AI Agent",
                "embedding_model": settings.EMBEDDING_MODEL,
                "chunk_size": settings.CHUNK_SIZE,
                "chunk_overlap": settings.CHUNK_OVERLAP
            }
        )

        logger.info(
            f"ChromaDB initialized successfully with {settings.EMBEDDING_MODEL} embeddings"
        )
        return _vector_store

    except Exception as e:
        logger.error("Failed to initialize vector store", exc_info=True)
        raise

def get_vector_store() -> Chroma:
    """Get the vector store instance"""
    if _vector_store is None:
        return init_vector_store()
    return _vector_store

def add_documents(
    texts: List[str],
    metadatas: Optional[List[Dict[str, Any]]] = None,
    **kwargs
) -> List[str]:
    """
    Add documents to the vector store with proper chunking
    """
    try:
        store = get_vector_store()
        
        # Split texts into chunks
        all_chunks = []
        all_metadatas = []
        
        for i, text in enumerate(texts):
            # Create chunks
            chunks = _text_splitter.split_text(text)
            all_chunks.extend(chunks)
            
            # Extend metadata to all chunks
            if metadatas:
                chunk_metadata = metadatas[i].copy()
                # Add chunk info to metadata
                chunk_metadata.update({
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "original_length": len(text)
                })
                all_metadatas.extend([chunk_metadata] * len(chunks))
        
        # Add to vector store
        ids = store.add_texts(
            texts=all_chunks,
            metadatas=all_metadatas if all_metadatas else None,
            **kwargs
        )
        
        logger.info(f"Added {len(ids)} chunks to vector store")
        return ids

    except Exception as e:
        logger.error("Failed to add documents", exc_info=True)
        raise

def similarity_search(
    query: str,
    k: int = 4,
    filter: Optional[Dict[str, Any]] = None,
    fetch_k: Optional[int] = None,
    **kwargs
) -> List[Document]:
    """
    Enhanced similarity search with better defaults and filtering
    """
    try:
        store = get_vector_store()
        
        # If fetch_k not specified, get more candidates for better results
        if fetch_k is None:
            fetch_k = min(k * 4, 20)
            
        results = store.similarity_search(
            query,
            k=k,
            filter=filter,
            fetch_k=fetch_k,
            **kwargs
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Similarity search failed: {str(e)}", exc_info=True)
        raise
