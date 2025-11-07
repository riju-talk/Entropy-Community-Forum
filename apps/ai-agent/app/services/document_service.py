"""
DEPRECATED: Document service functionality moved to LangChain service.
All document processing is now handled directly in qa.py routes using langchain_service.
"""
import logging

logger = logging.getLogger(__name__)
logger.warning("⚠️  document_service.py is DEPRECATED - using langchain_service directly")
