"""
Document Processing Service
"""

import os
import PyPDF2
import docx
from typing import Dict, Any, List, Tuple
import io
import re

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class DocumentProcessor:
    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"PDF processing error: {e}")
            raise Exception(f"PDF processing error: {str(e)}")
    
    @staticmethod
    def extract_text_from_docx(file_content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            doc = docx.Document(io.BytesIO(file_content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            logger.error(f"DOCX processing error: {e}")
            raise Exception(f"DOCX processing error: {str(e)}")
    
    @staticmethod
    def extract_text_from_txt(file_content: bytes) -> str:
        """Extract text from TXT"""
        try:
            return file_content.decode('utf-8').strip()
        except Exception as e:
            logger.error(f"TXT processing error: {e}")
            raise Exception(f"TXT processing error: {str(e)}")
    
    @staticmethod
    async def process_documents(files: List) -> List[str]:
        """Process multiple documents and return texts"""
        texts = []
        
        for file in files:
            content = await file.read()
            filename = file.filename.lower()
            
            try:
                if filename.endswith('.pdf'):
                    text = DocumentProcessor.extract_text_from_pdf(content)
                elif filename.endswith('.docx'):
                    text = DocumentProcessor.extract_text_from_docx(content)
                elif filename.endswith('.txt'):
                    text = DocumentProcessor.extract_text_from_txt(content)
                else:
                    logger.warning(f"Unsupported file type: {filename}")
                    continue
                
                if text:
                    texts.append(text)
            except Exception as e:
                logger.error(f"Error processing {filename}: {e}")
                continue
        
        return texts
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks"""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        
        return chunks

# Singleton
_processor_instance = None

def get_document_processor():
    global _processor_instance
    if _processor_instance is None:
        _processor_instance = DocumentProcessor()
    return _processor_instance
