"""
Document Processing Service
Handles PDF/TXT uploads and indexing
"""

import os
from typing import List
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.core.vector_store import get_vector_store
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class DocumentService:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )

    async def process_document(
        self,
        user_id: str,
        file_path: str,
        filename: str
    ) -> dict:
        """
        Process and index a document
        """
        try:
            # Load document based on type
            if filename.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            elif filename.endswith('.txt'):
                loader = TextLoader(file_path)
            else:
                raise ValueError(f"Unsupported file type: {filename}")

            # Load and split
            documents = loader.load()
            splits = self.text_splitter.split_documents(documents)

            # Add metadata
            for doc in splits:
                doc.metadata.update({
                    "user_id": user_id,
                    "filename": filename,
                    "source": filename
                })

            # Add to vector store
            self.vector_store.add_documents(splits)

            logger.info(f"Processed document {filename} for user {user_id}: {len(splits)} chunks")

            return {
                "filename": filename,
                "chunks": len(splits),
                "status": "indexed"
            }

        except Exception as e:
            logger.error(f"Document processing error: {str(e)}", exc_info=True)
            raise

    async def list_documents(self, user_id: str) -> List[str]:
        """
        List documents for a user
        """
        try:
            upload_dir = os.path.join(settings.UPLOAD_DIR, user_id)
            if not os.path.exists(upload_dir):
                return []

            return os.listdir(upload_dir)

        except Exception as e:
            logger.error(f"Error listing documents: {str(e)}")
            return []
