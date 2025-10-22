# Remaining Core Files - Part 2

### 12. `app/services/document_service.py`
\`\`\`python
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
\`\`\`

### 13. `app/services/embedding_service.py`
\`\`\`python
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
\`\`\`

### 14. `app/core/vector_store.py`
\`\`\`python
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
\`\`\`

### 15. `app/core/llm.py`
\`\`\`python
"""
LLM Client Wrapper
"""

from langchain.chat_models import ChatOpenAI
from typing import Optional

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

_llm_instance: Optional[ChatOpenAI] = None

def get_llm() -> ChatOpenAI:
    """
    Get LLM instance
    """
    global _llm_instance
    
    if _llm_instance is None:
        logger.info(f"Initializing LLM: {settings.LLM_MODEL}")
        
        _llm_instance = ChatOpenAI(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            max_tokens=settings.LLM_MAX_TOKENS,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        logger.info("LLM initialized successfully")
    
    return _llm_instance
\`\`\`

### 16. `app/api/routes.py`
\`\`\`python
"""
API Routes - All 4 Functions
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List
import os
import uuid

from app.api.auth import verify_token
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.flashcard import FlashcardRequest, FlashcardResponse
from app.schemas.quiz import QuizRequest, QuizResponse
from app.schemas.mindmap import MindMapRequest, MindMapResponse

from app.services.chat_service import ChatService
from app.services.flashcard_service import FlashcardService
from app.services.quiz_service import QuizService
from app.services.mindmap_service import MindMapService
from app.services.document_service import DocumentService

from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()

# Initialize services
chat_service = ChatService()
flashcard_service = FlashcardService()
quiz_service = QuizService()
mindmap_service = MindMapService()
document_service = DocumentService()

# ==================== FUNCTION 1: CONVERSATIONAL AI ====================

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    token: str = Depends(verify_token)
):
    """
    **Function 1: Conversational AI**
    
    Chat with Spark AI using context from uploaded materials.
    Generates intelligent responses with follow-up questions.
    
    **Cost**: 1-2 credits per message
    """
    try:
        logger.info(f"Chat request from user {request.user_id}")
        
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Calculate cost
        message_length = len(request.message)
        credits_used = settings.CHAT_SHORT_COST if message_length < 200 else settings.CHAT_LONG_COST
        
        # Get AI response
        result = await chat_service.chat(
            user_id=request.user_id,
            message=request.message,
            session_id=session_id,
            conversation_history=[]  # Load from DB in production
        )
        
        return ChatResponse(
            session_id=session_id,
            response=result["response"],
            follow_up_questions=result["follow_up_questions"],
            credits_used=credits_used
        )
    
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )

# ==================== FUNCTION 2: FLASHCARD GENERATION ====================

@router.post("/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(
    request: FlashcardRequest,
    token: str = Depends(verify_token)
):
    """
    **Function 2: Flashcard Generation**
    
    Generate study flashcards for any topic based on uploaded materials.
    Adjustable difficulty and card count.
    
    **Cost**: 3 credits
    """
    try:
        logger.info(f"Flashcard generation request from user {request.user_id}")
        
        flashcards = await flashcard_service.generate_flashcards(
            user_id=request.user_id,
            topic=request.topic,
            num_cards=request.num_cards,
            difficulty=request.difficulty.value
        )
        
        return FlashcardResponse(
            flashcards=flashcards,
            credits_used=settings.FLASHCARD_COST,
            total_generated=len(flashcards)
        )
    
    except Exception as e:
        logger.error(f"Flashcard generation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Flashcard generation failed: {str(e)}"
        )

# ==================== FUNCTION 3: QUIZ GENERATION ====================

@router.post("/quiz/generate", response_model=QuizResponse)
async def generate_quiz_endpoint(
    request: QuizRequest,
    token: str = Depends(verify_token)
):
    """
    **Function 3: Quiz Generation**
    
    Create interactive quizzes with multiple question types.
    Includes automatic grading and explanations.
    
    **Cost**: 4 credits
    """
    try:
        logger.info(f"Quiz generation request from user {request.user_id}")
        
        quiz = await quiz_service.generate_quiz(
            user_id=request.user_id,
            topic=request.topic,
            num_questions=request.num_questions,
            question_types=[qt.value for qt in request.question_types]
        )
        
        return QuizResponse(
            quiz=quiz,
            credits_used=settings.QUIZ_COST,
            total_questions=len(quiz)
        )
    
    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz generation failed: {str(e)}"
        )

# ==================== FUNCTION 4: MIND MAP GENERATION ====================

@router.post("/mindmap/generate", response_model=MindMapResponse)
async def generate_mindmap_endpoint(
    request: MindMapRequest,
    token: str = Depends(verify_token)
):
    """
    **Function 4: Mind Map Generation**
    
    Generate visual concept maps in Mermaid format.
    Multiple styles: hierarchical, radial, flowchart.
    
    **Cost**: 2.5 credits
    """
    try:
        logger.info(f"Mind map generation request from user {request.user_id}")
        
        result = await mindmap_service.generate_mindmap(
            user_id=request.user_id,
            topic=request.topic,
            depth=request.depth,
            style=request.style.value
        )
        
        return MindMapResponse(
            mind_map=result["mind_map"],
            mermaid_code=result["mermaid_code"],
            credits_used=settings.MINDMAP_COST
        )
    
    except Exception as e:
        logger.error(f"Mind map generation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mind map generation failed: {str(e)}"
        )

# ==================== DOCUMENT MANAGEMENT ====================

@router.post("/documents/upload")
async def upload_document_endpoint(
    user_id: str,
    file: UploadFile = File(...),
    token: str = Depends(verify_token)
):
    """
    Upload and process study materials (PDF/TXT)
    """
    try:
        # Validate file type
        if not any(file.filename.endswith(ext) for ext in settings.ALLOWED_FILE_TYPES):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {settings.ALLOWED_FILE_TYPES}"
            )
        
        # Validate file size
        file_content = await file.read()
        if len(file_content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
            )
        
        # Save file
        user_upload_dir = os.path.join(settings.UPLOAD_DIR, user_id)
        os.makedirs(user_upload_dir, exist_ok=True)
        
        file_path = os.path.join(user_upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Process document
        result = await document_service.process_document(
            user_id=user_id,
            file_path=file_path,
            filename=file.filename
        )
        
        logger.info(f"Document uploaded: {file.filename} for user {user_id}")
        
        return {
            "message": "Document uploaded and processed successfully",
            **result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document upload failed: {str(e)}"
        )

@router.get("/documents/{user_id}")
async def list_documents_endpoint(
    user_id: str,
    token: str = Depends(verify_token)
):
    """
    List uploaded documents for a user
    """
    try:
        documents = await document_service.list_documents(user_id)
        
        return {
            "user_id": user_id,
            "documents": documents,
            "count": len(documents)
        }
    
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list documents"
        )

# ==================== UTILITY ENDPOINTS ====================

@router.get("/info")
async def service_info():
    """
    Get service information and capabilities
    """
    return {
        "service": "Spark AI Agent",
        "version": settings.VERSION,
        "functions": [
            {
                "name": "chat",
                "description": "Conversational AI with context",
                "cost": f"{settings.CHAT_SHORT_COST}-{settings.CHAT_LONG_COST} credits"
            },
            {
                "name": "flashcards",
                "description": "Generate study flashcards",
                "cost": f"{settings.FLASHCARD_COST} credits"
            },
            {
                "name": "quiz",
                "description": "Create interactive quizzes",
                "cost": f"{settings.QUIZ_COST} credits"
            },
            {
                "name": "mindmap",
                "description": "Generate concept mind maps",
                "cost": f"{settings.MINDMAP_COST} credits"
            }
        ],
        "supported_file_types": settings.ALLOWED_FILE_TYPES,
        "max_upload_size_mb": settings.MAX_UPLOAD_SIZE / (1024 * 1024)
    }
\`\`\`

### 17. `app/utils/logger.py`
\`\`\`python
"""
Logging configuration
"""

import logging
import sys
from app.config import settings

def setup_logger(name: str) -> logging.Logger:
    """
    Setup and return a configured logger
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        # Set level
        level = logging.DEBUG if settings.DEBUG else logging.INFO
        logger.setLevel(level)
        
        # Create handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        
        # Add handler
        logger.addHandler(handler)
    
    return logger
\`\`\`

### 18. `app/utils/helpers.py`
\`\`\`python
"""
Helper utility functions
"""

import hashlib
from typing import Any, Dict
from datetime import datetime

def generate_id(prefix: str = "") -> str:
    """Generate a unique ID"""
    timestamp = datetime.now().isoformat()
    hash_obj = hashlib.md5(timestamp.encode())
    return f"{prefix}{hash_obj.hexdigest()[:12]}"

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal"""
    return filename.replace("..", "").replace("/", "").replace("\\", "")

def format_response(data: Any, message: str = None) -> Dict:
    """Format API response"""
    response = {"data": data}
    if message:
        response["message"] = message
    response["timestamp"] = datetime.now().isoformat()
    return response
\`\`\`

### 19. `requirements.txt`
\`\`\`txt
# FastAPI
fastapi==0.109.2
uvicorn[standard]==0.27.1
pydantic==2.6.1
pydantic-settings==2.1.0
python-multipart==0.0.9

# LangChain
langchain==0.1.6
langchain-openai==0.0.5
openai==1.12.0

# Vector Store
chromadb==0.4.22
sentence-transformers==2.3.1

# Document Processing
pypdf==4.0.1
python-docx==1.1.0

# Embeddings
torch==2.2.0
transformers==4.37.2

# Utilities
python-dotenv==1.0.1
python-jose[cryptography]==3.3.0
httpx==0.26.0

# Database (optional)
asyncpg==0.29.0
psycopg2-binary==2.9.9
\`\`\`

### 20. `requirements-dev.txt`
\`\`\`txt
# Testing
pytest==7.4.4
pytest-asyncio==0.23.4
pytest-cov==4.1.0
httpx==0.26.0

# Code Quality
black==24.1.1
flake8==7.0.0
mypy==1.8.0
isort==5.13.2

# Development
ipython==8.21.0
\`\`\`

### 21. `.env.example`
\`\`\`env
# Application
DEBUG=True
APP_NAME=Spark AI Agent

# Authentication
AI_BACKEND_TOKEN=your-secure-token-here
AI_BACKEND_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# LLM Configuration
LLM_MODEL=gpt-3.5-turbo
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

# Embedding Model
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Storage
CHROMA_PERSIST_DIR=./data/chroma_db
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE=10485760

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Credit Costs
CHAT_SHORT_COST=1.0
CHAT_LONG_COST=2.0
FLASHCARD_COST=3.0
QUIZ_COST=4.0
MINDMAP_COST=2.5
\`\`\`

### 22. `Dockerfile`
\`\`\`dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download embedding model at build time
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application
COPY ./app ./app

# Create data directories
RUN mkdir -p /app/data/chroma_db /app/data/uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### 23. `docker-compose.yml`
\`\`\`yaml
version: '3.8'

services:
  spark-ai:
    build: .
    container_name: spark-ai-agent
    ports:
      - "8000:8000"
    environment:
      - AI_BACKEND_TOKEN=${AI_BACKEND_TOKEN}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - AI_BACKEND_URL=http://host.docker.internal:3000
    volumes:
      - ./data:/app/data
      - ./app:/app/app
    restart: unless-stopped
\`\`\`

### 24. `README.md`
\`\`\`markdown
# 🌟 Spark AI Agent

Intelligent study assistant for the Entropy platform with 4 core functions:

1. **Conversational AI** - Context-aware chat
2. **Flashcard Generation** - Auto-generated study cards
3. **Quiz Generation** - Interactive quizzes
4. **Mind Map Generation** - Visual concept maps

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- OpenAI API Key

### Installation

1. Clone repository
\`\`\`bash
git clone <repo-url>
cd spark-ai-agent
\`\`\`

2. Create virtual environment
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

3. Install dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. Setup environment
\`\`\`bash
cp .env.example .env
# Edit .env and add your API keys
\`\`\`

5. Run server
\`\`\`bash
uvicorn app.main:app --reload --port 8000
\`\`\`

Server will be available at `http://localhost:8000`

### Docker Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

## 📚 API Documentation

Once running, visit:
- Interactive docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔧 Configuration

Edit `.env` file to configure:
- API keys
- Model settings
- Credit costs
- CORS origins

## 🧪 Testing

\`\`\`bash
pip install -r requirements-dev.txt
pytest tests/ -v
\`\`\`

## 📖 API Examples

### 1. Chat
\`\`\`bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "message": "Explain neural networks"
  }'
\`\`\`

### 2. Generate Flashcards
\`\`\`bash
curl -X POST http://localhost:8000/api/flashcards/generate \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "topic": "Python Data Structures",
    "num_cards": 10,
    "difficulty": "medium"
  }'
\`\`\`

### 3. Generate Quiz
\`\`\`bash
curl -X POST http://localhost:8000/api/quiz/generate \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "topic": "Database Normalization",
    "num_questions": 5,
    "question_types": ["mcq", "true_false"]
  }'
\`\`\`

### 4. Generate Mind Map
\`\`\`bash
curl -X POST http://localhost:8000/api/mindmap/generate \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "topic": "Machine Learning",
    "depth": 3,
    "style": "hierarchical"
  }'
\`\`\`

## 📁 Project Structure

See [ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 🤝 Integration with Entropy Platform

The AI agent communicates with your Next.js app at `localhost:3000`:
- Uses Bearer token authentication
- Returns structured JSON responses
- Supports file uploads for RAG

## 📝 License

MIT License
\`\`\`

This completes the full directory structure! All 4 functions are implemented with:
✅ Conversational AI with RAG
✅ Flashcard Generation  
✅ Quiz Generation
✅ Mind Map Generation
✅ Document upload & processing
✅ Authentication
✅ Complete API documentation
