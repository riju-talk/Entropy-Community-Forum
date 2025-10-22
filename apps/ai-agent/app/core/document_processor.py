"""
Document Processing Service
Handles text extraction and preprocessing
"""

import os
from typing import Dict, Any, List, Tuple
from pypdf import PdfReader
from docx import Document as DocxDocument
import re

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

def process_document(file_path: str) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Extract and preprocess text from documents
    Returns (texts, metadatas)
    """
    try:
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return _process_pdf(file_path)
        elif file_ext == '.txt':
            return _process_text(file_path)
        elif file_ext in ['.doc', '.docx']:
            return _process_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
            
    except Exception as e:
        logger.error(f"Document processing failed: {str(e)}", exc_info=True)
        raise

def _process_pdf(file_path: str) -> Tuple[List[str], List[Dict[str, Any]]]:
    """Process PDF files"""
    try:
        reader = PdfReader(file_path)
        texts = []
        metadatas = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text.strip():
                texts.append(text)
                metadatas.append({
                    "source": os.path.basename(file_path),
                    "page": i + 1,
                    "type": "pdf"
                })
        
        return texts, metadatas
        
    except Exception as e:
        logger.error(f"PDF processing failed: {str(e)}")
        raise

def _process_text(file_path: str) -> Tuple[List[str], List[Dict[str, Any]]]:
    """Process text files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
            
        # Split into sections if we detect markdown headers
        sections = _split_markdown_sections(text)
        
        texts = []
        metadatas = []
        
        for i, (title, content) in enumerate(sections):
            if content.strip():
                texts.append(content)
                metadatas.append({
                    "source": os.path.basename(file_path),
                    "section": title or f"Section {i+1}",
                    "type": "text"
                })
                
        return texts, metadatas
        
    except Exception as e:
        logger.error(f"Text file processing failed: {str(e)}")
        raise

def _process_docx(file_path: str) -> Tuple[List[str], List[Dict[str, Any]]]:
    """Process Word documents"""
    try:
        doc = DocxDocument(file_path)
        texts = []
        metadatas = []
        
        current_text = []
        
        for para in doc.paragraphs:
            if para.text.strip():
                current_text.append(para.text)
                
            # Start new section if we hit a heading
            if para.style.name.startswith('Heading'):
                if current_text:
                    texts.append('\n'.join(current_text))
                    metadatas.append({
                        "source": os.path.basename(file_path),
                        "section": para.text,
                        "type": "docx"
                    })
                    current_text = []
                    
        # Add remaining text
        if current_text:
            texts.append('\n'.join(current_text))
            metadatas.append({
                "source": os.path.basename(file_path),
                "section": "End",
                "type": "docx"
            })
            
        return texts, metadatas
        
    except Exception as e:
        logger.error(f"Word document processing failed: {str(e)}")
        raise

def _split_markdown_sections(text: str) -> List[Tuple[str, str]]:
    """Split text into sections based on markdown headers"""
    sections = []
    lines = text.split('\n')
    
    current_title = ''
    current_content = []
    
    for line in lines:
        # Check for markdown headers
        if re.match(r'^#+\s', line):
            # Save previous section
            if current_content:
                sections.append((current_title, '\n'.join(current_content)))
                current_content = []
            current_title = line.lstrip('#').strip()
        else:
            current_content.append(line)
            
    # Add final section
    if current_content:
        sections.append((current_title, '\n'.join(current_content)))
        
    return sections or [('', text)]  # Default to whole text if no sections
