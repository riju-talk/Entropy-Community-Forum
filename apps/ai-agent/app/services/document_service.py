"""
Document Processing Service
Handles document uploads, processing, and indexing
"""

import os
from typing import List, Dict, Any

from app.core.vector_store import get_vector_store
from app.core.document_processor import process_document
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class DocumentService:
    def __init__(self):
        self.vector_store = get_vector_store()

    async def process_document(
        self,
        user_id: str,
        file_path: str,
        filename: str
    ) -> Dict[str, Any]:
        """
        Process and index a document using improved processor
        """
        try:
            # Process document (extract text and metadata)
            texts, metadatas = process_document(file_path)
            
            # Add user_id to all metadata
            for metadata in metadatas:
                metadata["user_id"] = user_id
                metadata["filename"] = filename
            
            # Add to vector store (it handles chunking)
            chunk_ids = self.vector_store.add_documents(
                texts=texts,
                metadatas=metadatas
            )
            
            logger.info(
                f"Processed {filename} for user {user_id}: "
                f"{len(texts)} sections, {len(chunk_ids)} chunks"
            )
            
            return {
                "filename": filename,
                "sections": len(texts),
                "chunks": len(chunk_ids),
                "status": "indexed"
            }
            
        except Exception as e:
            logger.error(f"Document processing error: {str(e)}", exc_info=True)
            raise

    async def list_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """
        List documents for a user with metadata from vector store
        """
        try:
            # Get files from upload directory
            upload_dir = os.path.join(settings.UPLOAD_DIR, user_id)
            if not os.path.exists(upload_dir):
                return []
                
            files = os.listdir(upload_dir)
            
            # Get document metadata from vector store
            documents = []
            store = get_vector_store()
            
            for filename in files:
                try:
                    # Search for any chunk from this file
                    results = store.similarity_search(
                        "",  # empty query to match metadata only
                        filter={
                            "user_id": user_id,
                            "filename": filename
                        },
                        k=1
                    )
                    
                    if results:
                        doc = results[0]
                        documents.append({
                            "filename": filename,
                            "type": doc.metadata.get("type", "unknown"),
                            "sections": doc.metadata.get("total_chunks", 1),
                            "indexed": True,
                            "last_modified": os.path.getmtime(
                                os.path.join(upload_dir, filename)
                            )
                        })
                    else:
                        # File exists but not in vector store
                        documents.append({
                            "filename": filename,
                            "type": os.path.splitext(filename)[1][1:],
                            "indexed": False,
                            "last_modified": os.path.getmtime(
                                os.path.join(upload_dir, filename)
                            )
                        })
                        
                except Exception as e:
                    logger.warning(f"Error getting metadata for {filename}: {e}")
                    continue
            
            # Sort by last modified
            documents.sort(key=lambda x: x["last_modified"], reverse=True)
            return documents

        except Exception as e:
            logger.error(f"Error listing documents: {str(e)}")
            return []
