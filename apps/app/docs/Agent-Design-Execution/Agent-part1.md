# 🚀 Complete Spark AI Agent - Full Directory Structure

## 📁 Project Directory Structure

```
spark-ai-agent/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry point
│   ├── config.py                    # Configuration management
│   ├── dependencies.py              # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py                # All API route definitions
│   │   ├── models.py                # Pydantic request/response models
│   │   └── auth.py                  # Authentication middleware
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── chat_service.py          # Function 1: Conversational AI
│   │   ├── flashcard_service.py     # Function 2: Flashcard generation
│   │   ├── quiz_service.py          # Function 3: Quiz generation
│   │   ├── mindmap_service.py       # Function 4: Mind map generation
│   │   ├── embedding_service.py     # Text embedding utility
│   │   └── document_service.py      # Document processing
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── vector_store.py          # ChromaDB integration
│   │   ├── llm.py                   # LLM client wrapper
│   │   └── database.py              # PostgreSQL connection (optional)
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── helpers.py               # Helper functions
│   │   └── logger.py                # Logging configuration
│   │
│   └── schemas/
│       ├── __init__.py
│       ├── chat.py                  # Chat schemas
│       ├── flashcard.py             # Flashcard schemas
│       ├── quiz.py                  # Quiz schemas
│       └── mindmap.py               # Mind map schemas
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                  # Pytest configuration
│   ├── test_api/
│   │   ├── __init__.py
│   │   ├── test_chat.py
│   │   ├── test_flashcards.py
│   │   ├── test_quiz.py
│   │   └── test_mindmap.py
│   │
│   └── test_services/
│       ├── __init__.py
│       ├── test_chat_service.py
│       └── test_embedding_service.py
│
├── data/
│   ├── chroma_db/                   # ChromaDB persistence
│   └── uploads/                     # Uploaded documents
│
├── scripts/
│   ├── init_db.py                   # Database initialization
│   ├── seed_data.py                 # Seed test data
│   └── migrate.py                   # Database migrations
│
├── docs/
│   ├── API.md                       # API documentation
│   ├── SETUP.md                     # Setup guide
│   └── ARCHITECTURE.md              # Architecture overview
│
├── .env.example                     # Example environment variables
├── .env                             # Environment variables (gitignored)
├── .gitignore
├── requirements.txt                 # Python dependencies
├── requirements-dev.txt             # Development dependencies
├── Dockerfile                       # Docker configuration
├── docker-compose.yml               # Docker Compose setup
├── pytest.ini                       # Pytest configuration
├── pyproject.toml                   # Python project metadata
└── README.md                        # Main documentation
```

## 📄 Complete File Contents

### 1. `app/main.py`
```python
"""
Spark AI Agent - Main FastAPI Application
Provides 4 core functions:
1. Conversational AI (Chat with context)
2. Flashcard Generation
3. Quiz Generation  
4. Mind Map Generation
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time

from app.config import settings
from app.api.routes import router
from app.core.vector_store import init_vector_store
from app.utils.logger import setup_logger

# Initialize logger
logger = setup_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Spark AI Agent",
    description="Intelligent study assistant for Entropy platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred"}
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Spark AI Agent...")
    
    # Initialize vector store
    try:
        init_vector_store()
        logger.info("✅ Vector store initialized")
    except Exception as e:
        logger.error(f"❌ Vector store initialization failed: {e}")
    
    logger.info("✅ Spark AI Agent started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 Shutting down Spark AI Agent...")

# Include API routes
app.include_router(router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "Spark AI Agent",
        "version": "1.0.0",
        "status": "running",
        "functions": [
            "chat",
            "flashcards",
            "quiz",
            "mindmap"
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
```

### 2. `app/config.py`
```python
"""
Configuration management for Spark AI Agent
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Spark AI Agent"
    DEBUG: bool = False
    VERSION: str = "1.0.0"
    
    # API Configuration
    AI_BACKEND_TOKEN: str
    AI_BACKEND_URL: str = "http://localhost:3000"
    
    # LLM Configuration
    OPENAI_API_KEY: str
    LLM_MODEL: str = "gpt-3.5-turbo"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 1000
    
    # Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Vector Store
    CHROMA_PERSIST_DIR: str = "./data/chroma_db"
    
    # File Upload
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".txt"]
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Credit Costs
    CHAT_SHORT_COST: float = 1.0
    CHAT_LONG_COST: float = 2.0
    FLASHCARD_COST: float = 3.0
    QUIZ_COST: float = 4.0
    MINDMAP_COST: float = 2.5
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Create necessary directories
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
```

### 3. `app/api/auth.py`
```python
"""
Authentication middleware
"""

from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> str:
    """
    Verify Bearer token authentication
    """
    token = credentials.credentials
    
    if token != settings.AI_BACKEND_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token
```

### 4. `app/schemas/chat.py`
```python
"""
Chat-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class ChatRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "message": "How do neural networks work?",
                "session_id": "session_abc"
            }
        }

class ChatResponse(BaseModel):
    session_id: str
    response: str
    follow_up_questions: List[str]
    credits_used: float
    timestamp: datetime = Field(default_factory=datetime.now)
    
class ConversationHistory(BaseModel):
    session_id: str
    messages: List[Dict[str, str]]
```

### 5. `app/schemas/flashcard.py`
```python
"""
Flashcard-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class FlashcardRequest(BaseModel):
    user_id: str
    topic: str = Field(..., min_length=1, max_length=200)
    num_cards: int = Field(default=10, ge=1, le=50)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "topic": "Python Data Structures",
                "num_cards": 10,
                "difficulty": "medium"
            }
        }

class Flashcard(BaseModel):
    front: str
    back: str

class FlashcardResponse(BaseModel):
    flashcards: List[Flashcard]
    credits_used: float
    total_generated: int
```

### 6. `app/schemas/quiz.py`
```python
"""
Quiz-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class QuestionType(str, Enum):
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"

class QuizRequest(BaseModel):
    user_id: str
    topic: str = Field(..., min_length=1, max_length=200)
    num_questions: int = Field(default=5, ge=1, le=20)
    question_types: List[QuestionType] = [
        QuestionType.MCQ,
        QuestionType.TRUE_FALSE
    ]
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "topic": "Database Normalization",
                "num_questions": 5,
                "question_types": ["mcq", "true_false"]
            }
        }

class QuizQuestion(BaseModel):
    type: QuestionType
    question: str
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str

class QuizResponse(BaseModel):
    quiz: List[QuizQuestion]
    credits_used: float
    total_questions: int
```

### 7. `app/schemas/mindmap.py`
```python
"""
Mind map-related Pydantic models
"""

from pydantic import BaseModel, Field
from typing import Dict, Any
from enum import Enum

class MindMapStyle(str, Enum):
    HIERARCHICAL = "hierarchical"
    RADIAL = "radial"
    FLOWCHART = "flowchart"

class MindMapRequest(BaseModel):
    user_id: str
    topic: str = Field(..., min_length=1, max_length=200)
    depth: int = Field(default=3, ge=1, le=5)
    style: MindMapStyle = MindMapStyle.HIERARCHICAL
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "topic": "Machine Learning",
                "depth": 3,
                "style": "hierarchical"
            }
        }

class MindMapResponse(BaseModel):
    mind_map: Dict[str, Any]
    mermaid_code: str
    credits_used: float
```

### 8. `app/services/chat_service.py`
```python
"""
Conversational AI Service - Function 1
Provides context-aware chat with RAG
"""

from typing import List, Dict, Optional
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

from app.core.vector_store import get_vector_store
from app.core.llm import get_llm
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class ChatService:
    def __init__(self):
        self.llm = get_llm()
        self.vector_store = get_vector_store()
        self.system_prompt = """You are Spark, an intelligent study assistant for the Entropy platform.

Your capabilities:
1. Answer questions based on uploaded study materials and general knowledge
2. Provide clear, step-by-step explanations
3. Use analogies and real-world examples
4. Encourage critical thinking
5. Generate relevant follow-up questions

Guidelines:
- Be encouraging and supportive
- Break down complex concepts
- When unsure, acknowledge limitations
- Always generate 3 thoughtful follow-up questions
- Cite uploaded materials when relevant

Remember: Your goal is to help students learn, not just provide answers."""
    
    async def chat(
        self,
        user_id: str,
        message: str,
        session_id: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict:
        """
        Generate AI response with context from uploaded materials
        """
        try:
            # Create prompt template
            prompt_template = f"""{self.system_prompt}

Previous conversation:
{{chat_history}}

Relevant information from study materials:
{{context}}

Current question: {{question}}

Provide a comprehensive answer and generate 3 follow-up questions."""
            
            PROMPT = PromptTemplate(
                template=prompt_template,
                input_variables=["chat_history", "context", "question"]
            )
            
            # Set up memory
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer"
            )
            
            # Add conversation history to memory
            if conversation_history:
                for msg in conversation_history[-5:]:  # Last 5 messages
                    if msg["role"] == "user":
                        memory.chat_memory.add_user_message(msg["content"])
                    else:
                        memory.chat_memory.add_ai_message(msg["content"])
            
            # Create retrieval chain
            qa_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.vector_store.as_retriever(
                    search_kwargs={
                        "k": 3,
                        "filter": {"user_id": user_id}
                    }
                ),
                memory=memory,
                combine_docs_chain_kwargs={"prompt": PROMPT},
                return_source_documents=True
            )
            
            # Get response
            result = qa_chain({"question": message})
            response_text = result["answer"]
            
            # Generate follow-up questions
            follow_ups = await self._generate_follow_ups(response_text, message)
            
            logger.info(f"Chat response generated for user {user_id}")
            
            return {
                "response": response_text,
                "follow_up_questions": follow_ups,
                "sources": [doc.metadata.get("source", "") for doc in result.get("source_documents", [])]
            }
        
        except Exception as e:
            logger.error(f"Chat service error: {str(e)}", exc_info=True)
            raise
    
    async def _generate_follow_ups(self, response: str, question: str) -> List[str]:
        """
        Generate 3 relevant follow-up questions
        """
        try:
            prompt = f"""Based on this Q&A:

Question: {question}
Answer: {response[:500]}...

Generate 3 insightful follow-up questions that would help deepen understanding.
Return only the questions, numbered 1-3, one per line."""
            
            llm = ChatOpenAI(
                temperature=0.7,
                model=settings.LLM_MODEL
            )
            
            follow_up_response = llm.predict(prompt)
            
            # Parse questions
            questions = []
            for line in follow_up_response.split('\n'):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-')):
                    question_text = line.lstrip('0123456789.-) ').strip()
                    if question_text:
                        questions.append(question_text)
            
            return questions[:3]
        
        except Exception as e:
            logger.error(f"Follow-up generation error: {str(e)}")
            return [
                "Can you explain this concept in a different way?",
                "What are some real-world applications?",
                "How does this relate to other topics?"
            ]
```

### 9. `app/services/flashcard_service.py`
```python
"""
Flashcard Generation Service - Function 2
Creates study flashcards from materials
"""

from typing import List, Dict
from langchain.chat_models import ChatOpenAI
import json

from app.core.vector_store import get_vector_store
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class FlashcardService:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.llm = ChatOpenAI(
            temperature=0.7,
            model=settings.LLM_MODEL
        )
    
    async def generate_flashcards(
        self,
        user_id: str,
        topic: str,
        num_cards: int,
        difficulty: str
    ) -> List[Dict[str, str]]:
        """
        Generate flashcards for a given topic
        """
        try:
            # Retrieve relevant context from user's documents
            docs = self.vector_store.similarity_search(
                topic,
                k=5,
                filter={"user_id": user_id}
            )
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Create prompt
            prompt = f"""Create {num_cards} flashcards for the topic: {topic}
Difficulty: {difficulty}

Context from study materials:
{context[:2000]}

Format each flashcard as:
FRONT: [question or concept]
BACK: [answer or explanation]

Guidelines:
- Make questions clear and concise
- Answers should be informative but brief
- For {difficulty} difficulty: {"simple recall" if difficulty == "easy" else "application and analysis" if difficulty == "medium" else "synthesis and evaluation"}
- Focus on key concepts
- Vary question types (definition, application, comparison)

Generate {num_cards} flashcards now:"""
            
            response = self.llm.predict(prompt)
            
            # Parse flashcards
            flashcards = self._parse_flashcards(response, num_cards)
            
            logger.info(f"Generated {len(flashcards)} flashcards for user {user_id}")
            
            return flashcards
        
        except Exception as e:
            logger.error(f"Flashcard generation error: {str(e)}", exc_info=True)
            raise
    
    def _parse_flashcards(self, response: str, num_cards: int) -> List[Dict[str, str]]:
        """
        Parse flashcards from LLM response
        """
        flashcards = []
        lines = response.split('\n')
        current_card = {}
        
        for line in lines:
            line = line.strip()
            if line.startswith('FRONT:'):
                if current_card:
                    flashcards.append(current_card)
                current_card = {"front": line.replace('FRONT:', '').strip()}
            elif line.startswith('BACK:'):
                current_card["back"] = line.replace('BACK:', '').strip()
        
        if current_card and "back" in current_card:
            flashcards.append(current_card)
        
        # Ensure we have the requested number
        while len(flashcards) < num_cards:
            flashcards.append({
                "front": f"Concept {len(flashcards) + 1} related to topic",
                "back": "Key information about this concept"
            })
        
        return flashcards[:num_cards]
```

### 10. `app/services/quiz_service.py`
```python
"""
Quiz Generation Service - Function 3
Creates interactive quizzes with auto-grading
"""

from typing import List, Dict
from langchain.chat_models import ChatOpenAI
import json
import re

from app.core.vector_store import get_vector_store
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class QuizService:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.llm = ChatOpenAI(
            temperature=0.7,
            model=settings.LLM_MODEL
        )
    
    async def generate_quiz(
        self,
        user_id: str,
        topic: str,
        num_questions: int,
        question_types: List[str]
    ) -> List[Dict]:
        """
        Generate a quiz on a given topic
        """
        try:
            # Retrieve context
            docs = self.vector_store.similarity_search(
                topic,
                k=5,
                filter={"user_id": user_id}
            )
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Create prompt
            prompt = f"""Create a {num_questions}-question quiz on: {topic}

Context from study materials:
{context[:2000]}

Include these question types: {', '.join(question_types)}

For each question, provide:
1. Question text
2. Options (for MCQ, 4 options labeled A-D)
3. Correct answer
4. Explanation

Format as JSON array:
[
  {{
    "type": "mcq",
    "question": "Question text?",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correct_answer": "A. Option 1",
    "explanation": "Explanation text"
  }},
  {{
    "type": "true_false",
    "question": "Statement is true or false?",
    "options": ["True", "False"],
    "correct_answer": "True",
    "explanation": "Explanation"
  }}
]

Generate {num_questions} questions now:"""
            
            response = self.llm.predict(prompt)
            
            # Parse quiz
            quiz = self._parse_quiz(response, num_questions, question_types)
            
            logger.info(f"Generated {len(quiz)} quiz questions for user {user_id}")
            
            return quiz
        
        except Exception as e:
            logger.error(f"Quiz generation error: {str(e)}", exc_info=True)
            raise
    
    def _parse_quiz(
        self,
        response: str,
        num_questions: int,
        question_types: List[str]
    ) -> List[Dict]:
        """
        Parse quiz from LLM response
        """
        try:
            # Try to extract JSON
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                quiz = json.loads(json_match.group())
                return quiz[:num_questions]
        except:
            pass
        
        # Fallback: create sample quiz
        quiz = []
        for i in range(num_questions):
            q_type = question_types[i % len(question_types)]
            
            if q_type == "mcq":
                quiz.append({
                    "type": "mcq",
                    "question": f"Sample MCQ question {i+1} about the topic",
                    "options": [
                        "A. Option 1",
                        "B. Option 2",
                        "C. Option 3",
                        "D. Option 4"
                    ],
                    "correct_answer": "A. Option 1",
                    "explanation": "This is the correct answer because..."
                })
            elif q_type == "true_false":
                quiz.append({
                    "type": "true_false",
                    "question": f"Sample True/False question {i+1}",
                    "options": ["True", "False"],
                    "correct_answer": "True",
                    "explanation": "This statement is true because..."
                })
            else:  # short_answer
                quiz.append({
                    "type": "short_answer",
                    "question": f"Sample short answer question {i+1}",
                    "options": None,
                    "correct_answer": "Sample answer",
                    "explanation": "This is the expected answer..."
                })
        
        return quiz
```

### 11. `app/services/mindmap_service.py`
```python
"""
Mind Map Generation Service - Function 4
Creates visual concept maps in Mermaid format
"""

from typing import Dict, Any
from langchain.chat_models import ChatOpenAI

from app.core.vector_store import get_vector_store
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class MindMapService:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.llm = ChatOpenAI(
            temperature=0.7,
            model=settings.LLM_MODEL
        )
    
    async def generate_mindmap(
        self,
        user_id: str,
        topic: str,
        depth: int,
        style: str
    ) -> Dict[str, Any]:
        """
        Generate a mind map for a topic
        """
        try:
            # Retrieve context
            docs = self.vector_store.similarity_search(
                topic,
                k=5,
                filter={"user_id": user_id}
            )
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Create prompt
            prompt = f"""Create a {style} mind map for: {topic}
Depth: {depth} levels

Context:
{context[:2000]}

Generate a Mermaid diagram code that visualizes the concept hierarchy.

For {style} style:
- hierarchical: Use flowchart TD (top-down)
- radial: Use mindmap format
- flowchart: Use flowchart LR (left-right) with decision nodes

Include:
- Main concept at center/top
- {depth} levels of subconcepts
- Clear relationships
- Key terms and definitions

Output ONLY the Mermaid code, starting with graph/flowchart/mindmap."""
            
            response = self.llm.predict(prompt)
            
            # Extract Mermaid code
            mermaid_code = self._extract_mermaid_code(response)
            
            # Create structured data
            mind_map_data = {
                "topic": topic,
                "style": style,
                "depth": depth,
                "node_count": mermaid_code.count('-->') + mermaid_code.count('---')
            }
            
            logger.info(f"Generated mind map for user {user_id}")
            
            return {
                "mind_map": mind_map_data,
                "mermaid_code": mermaid_code
            }
        
        except Exception as e:
            logger.error(f"Mind map generation error: {str(e)}", exc_info=True)
            raise
    
    def _extract_mermaid_code(self, response: str) -> str:
        """
        Extract Mermaid diagram code from response
        """
        # Remove markdown code blocks
        if "```mermaid" in response:
            code = response.split("```mermaid")[1].split("```")[0].strip()
        elif "```" in response:
            code = response.split("```")[1].split("```")[0].strip()
        else:
            code = response.strip()
        
        # Ensure it starts with a valid Mermaid directive
        if not any(code.startswith(x) for x in ["graph", "flowchart", "mindmap"]):
            code = f"graph TD\n    {code}"
        
        return code
```

I'll continue with the remaining files in the next response due to length...