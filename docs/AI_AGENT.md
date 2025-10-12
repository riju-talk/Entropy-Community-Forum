# AI Agent Service Design & Implementation Guide

> **Status**: 🔮 **Future Implementation** - Complete Design Specification

> ⚠️ **Not Yet Implemented** - This is a complete design document to guide future development or feed to AI for code generation.

This document provides complete specifications for building the AI Agent microservice using FastAPI, Elasticsearch, and AI/ML technologies.

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [API Endpoints](#api-endpoints)
5. [Elasticsearch Setup](#elasticsearch-setup)
6. [Implementation Guide](#implementation-guide)
7. [Deployment](#deployment)

---

## Overview

### Purpose
The AI Agent service provides intelligent features for the Entropy platform:
- **Conversational AI**: Chat with users to help solve problems
- **Question Recommendations**: Suggest relevant questions based on user context
- **Answer Quality Scoring**: Evaluate and rank answer quality
- **Smart Search**: Advanced search with semantic understanding
- **Duplicate Detection**: Find similar questions to reduce duplicates

### Service Type
- **Microservice**: Independent FastAPI application
- **Communication**: REST API over HTTP
- **Authentication**: Bearer token
- **Database**: Elasticsearch for vector search + PostgreSQL for metadata

---

## Architecture

### High-Level Architecture

\`\`\`
┌──────────────────────────────────────────────────────┐
│              Next.js Frontend/Backend                │
│         (Main Entropy Platform)                      │
└────────────────────┬─────────────────────────────────┘
                     │ HTTP/REST
                     │ (Bearer Token Auth)
                     ▼
┌──────────────────────────────────────────────────────┐
│              AI Agent Service (FastAPI)              │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │   Chat      │  │ Recommend    │  │   Search   │  │
│  │  Engine     │  │   Engine     │  │   Engine   │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Embedding Service (Sentence-BERT)       │ │
│  └─────────────────────────────────────────────────┘ │
└────────────────────┬──────────────┬──────────────────┘
                     │              │
                     ▼              ▼
            ┌─────────────┐   ┌──────────────┐
            │Elasticsearch│   │  PostgreSQL  │
            │  (Vectors)  │   │  (Metadata)  │
            └─────────────┘   └──────────────┘
\`\`\`

### Component Breakdown

1. **API Layer** (FastAPI routes)
   - Authentication middleware
   - Request validation (Pydantic)
   - Response formatting
   - Error handling

2. **Business Logic Layer**
   - Chat engine (LLM integration)
   - Recommendation engine
   - Search engine
   - Duplicate detection

3. **Data Layer**
   - Elasticsearch (vector storage)
   - PostgreSQL (via REST API to main app)
   - In-memory cache (Redis optional)

4. **ML/AI Layer**
   - Sentence embeddings (Sentence-BERT)
   - LLM integration (OpenAI/Claude/Local)
   - Answer quality scoring

---

## Technology Stack

### Core Framework
- **FastAPI**: Modern, fast web framework
- **Python 3.11+**: Latest Python features
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### AI/ML Libraries
- **Sentence-Transformers**: Text embeddings
  - Model: `all-MiniLM-L6-v2` (lightweight, fast)
  - Or: `all-mpnet-base-v2` (higher quality)
- **OpenAI API** (optional): GPT-4 for chat
- **Anthropic API** (optional): Claude for chat
- **LangChain**: LLM orchestration
- **scikit-learn**: ML utilities

### Search & Storage
- **Elasticsearch 8.x**: Vector database
  - Dense vector search
  - Full-text search
  - Hybrid search (combination)
- **elasticsearch-py**: Python client
- **Redis** (optional): Caching

### Supporting Libraries
- **httpx**: Async HTTP client
- **python-jose**: JWT handling
- **python-dotenv**: Environment variables
- **pytest**: Testing

---

## API Endpoints

### Base URL
\`\`\`
Development: http://localhost:8000
Production: https://ai.entropy-platform.com
\`\`\`

### Authentication
All endpoints require Bearer token authentication:
\`\`\`
Authorization: Bearer <AI_BACKEND_TOKEN>
\`\`\`

---

### 1. Chat Endpoint

**POST /api/chat**

Send a message and get AI response.

**Request Body**:
\`\`\`json
{
  "message": "How do I solve quadratic equations?",
  "conversation_id": "conv_123" (optional),
  "user_id": "user_456",
  "context": {
    "subject": "MATHEMATICS",
    "recent_doubts": ["doubt_789"],
    "user_level": 2
  }
}
\`\`\`

**Response**:
\`\`\`json
{
  "conversation_id": "conv_123",
  "message": "AI response here...",
  "related_doubts": [
    {
      "id": "doubt_101",
      "title": "Solving ax² + bx + c = 0",
      "similarity": 0.89
    }
  ],
  "confidence": 0.92,
  "sources": ["doubt_789", "doubt_234"]
}
\`\`\`

---

### 2. Recommendations Endpoint

**POST /api/recommend**

Get personalized question recommendations.

**Request Body**:
\`\`\`json
{
  "user_id": "user_456",
  "limit": 10,
  "filters": {
    "subjects": ["MATHEMATICS", "PHYSICS"],
    "difficulty": "medium",
    "exclude_seen": true
  }
}
\`\`\`

**Response**:
\`\`\`json
{
  "recommendations": [
    {
      "doubt_id": "doubt_123",
      "title": "Question title",
      "subject": "MATHEMATICS",
      "score": 0.95,
      "reason": "Based on your interest in calculus"
    }
  ]
}
\`\`\`

---

### 3. Search Endpoint

**POST /api/search**

Advanced semantic search.

**Request Body**:
\`\`\`json
{
  "query": "integration by parts",
  "subject": "MATHEMATICS" (optional),
  "limit": 20,
  "search_type": "hybrid" // "semantic", "keyword", or "hybrid"
}
\`\`\`

**Response**:
\`\`\`json
{
  "results": [
    {
      "doubt_id": "doubt_456",
      "title": "How to use integration by parts?",
      "snippet": "...relevant excerpt...",
      "score": 0.88,
      "highlights": ["<em>integration</em> by <em>parts</em>"]
    }
  ],
  "total": 125,
  "took_ms": 45
}
\`\`\`

---

### 4. Index Endpoint

**POST /api/index**

Index new or updated content (called by main app).

**Request Body**:
\`\`\`json
{
  "doubt_id": "doubt_789",
  "title": "Question title",
  "content": "Full question content...",
  "subject": "MATHEMATICS",
  "tags": ["calculus", "derivatives"],
  "metadata": {
    "author_id": "user_123",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

**Response**:
\`\`\`json
{
  "status": "indexed",
  "doubt_id": "doubt_789",
  "embedding_dims": 384
}
\`\`\`

---

### 5. Similar Questions Endpoint

**POST /api/similar**

Find duplicate or similar questions.

**Request Body**:
\`\`\`json
{
  "title": "How to solve quadratic equations?",
  "content": "I'm struggling with...",
  "threshold": 0.85 // similarity threshold
}
\`\`\`

**Response**:
\`\`\`json
{
  "similar_questions": [
    {
      "doubt_id": "doubt_234",
      "title": "Solving quadratic equations",
      "similarity": 0.92,
      "is_duplicate": true
    }
  ]
}
\`\`\`

---

### 6. Answer Quality Endpoint

**POST /api/evaluate-answer**

Score answer quality.

**Request Body**:
\`\`\`json
{
  "doubt_id": "doubt_123",
  "answer_content": "Answer text...",
  "answer_id": "comment_456"
}
\`\`\`

**Response**:
\`\`\`json
{
  "quality_score": 0.87,
  "factors": {
    "relevance": 0.92,
    "completeness": 0.85,
    "clarity": 0.84,
    "code_quality": 0.90
  },
  "feedback": "Good answer, could add more examples"
}
\`\`\`

---

## Elasticsearch Setup

### Index Schema

\`\`\`python
# Doubts Index
DOUBT_INDEX = {
    "mappings": {
        "properties": {
            "doubt_id": {"type": "keyword"},
            "title": {
                "type": "text",
                "analyzer": "english",
                "fields": {
                    "keyword": {"type": "keyword"}
                }
            },
            "content": {
                "type": "text",
                "analyzer": "english"
            },
            "subject": {"type": "keyword"},
            "tags": {"type": "keyword"},
            "embedding": {
                "type": "dense_vector",
                "dims": 384,  # For all-MiniLM-L6-v2
                "index": True,
                "similarity": "cosine"
            },
            "metadata": {
                "properties": {
                    "author_id": {"type": "keyword"},
                    "created_at": {"type": "date"},
                    "votes": {"type": "integer"},
                    "views": {"type": "integer"},
                    "is_resolved": {"type": "boolean"}
                }
            }
        }
    },
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 1,
        "analysis": {
            "analyzer": {
                "english": {
                    "type": "standard",
                    "stopwords": "_english_"
                }
            }
        }
    }
}
\`\`\`

### Vector Search Query

\`\`\`python
# Hybrid search (semantic + keyword)
def hybrid_search(query: str, subject: str = None, limit: int = 20):
    # Generate embedding for query
    query_embedding = get_embedding(query)
    
    # Build Elasticsearch query
    es_query = {
        "query": {
            "script_score": {
                "query": {
                    "bool": {
                        "should": [
                            {
                                "match": {
                                    "title": {
                                        "query": query,
                                        "boost": 2.0
                                    }
                                }
                            },
                            {
                                "match": {
                                    "content": {
                                        "query": query
                                    }
                                }
                            }
                        ],
                        "filter": [
                            {"term": {"subject": subject}} if subject else None
                        ]
                    }
                },
                "script": {
                    "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                    "params": {
                        "query_vector": query_embedding
                    }
                }
            }
        },
        "size": limit
    }
    
    return es.search(index="doubts", body=es_query)
\`\`\`

---

## Implementation Guide

### Project Structure

\`\`\`
ai-agent-service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py           # All API routes
│   │   ├── auth.py             # Authentication
│   │   └── models.py           # Pydantic models
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── chat_service.py     # Chat logic
│   │   ├── search_service.py   # Search logic
│   │   ├── recommend_service.py
│   │   ├── embedding_service.py
│   │   └── quality_service.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── elasticsearch.py    # ES client
│   │   ├── llm.py              # LLM integration
│   │   └── cache.py            # Caching
│   │
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
│
├── tests/
│   ├── test_api.py
│   ├── test_services.py
│   └── test_search.py
│
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
\`\`\`

### Core Implementation Files

#### 1. `app/main.py`

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="Entropy AI Agent",
    version="1.0.0",
    docs_url="/docs"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
security = HTTPBearer()
AI_BACKEND_TOKEN = os.getenv("AI_BACKEND_TOKEN")

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if credentials.credentials != AI_BACKEND_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials.credentials

# Include routes
from app.api.routes import router
app.include_router(router, prefix="/api", dependencies=[Depends(verify_token)])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
\`\`\`

#### 2. `app/services/embedding_service.py`

\`\`\`python
from sentence_transformers import SentenceTransformer
from functools import lru_cache
import numpy as np

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
    
    def encode(self, text: str) -> np.ndarray:
        """Generate embedding for text"""
        return self.model.encode(text, convert_to_numpy=True)
    
    def encode_batch(self, texts: list[str]) -> np.ndarray:
        """Generate embeddings for multiple texts"""
        return self.model.encode(texts, convert_to_numpy=True)
    
    def similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        emb1 = self.encode(text1)
        emb2 = self.encode(text2)
        return np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

@lru_cache()
def get_embedding_service():
    return EmbeddingService()
\`\`\`

#### 3. `app/services/search_service.py`

\`\`\`python
from elasticsearch import Elasticsearch
from app.services.embedding_service import get_embedding_service
from typing import List, Dict, Optional

class SearchService:
    def __init__(self, es_client: Elasticsearch):
        self.es = es_client
        self.embedding_service = get_embedding_service()
    
    async def search(
        self,
        query: str,
        subject: Optional[str] = None,
        limit: int = 20,
        search_type: str = "hybrid"
    ) -> List[Dict]:
        """
        Search doubts using hybrid (semantic + keyword) search
        """
        if search_type == "semantic":
            return await self._semantic_search(query, subject, limit)
        elif search_type == "keyword":
            return await self._keyword_search(query, subject, limit)
        else:
            return await self._hybrid_search(query, subject, limit)
    
    async def _hybrid_search(
        self, query: str, subject: Optional[str], limit: int
    ) -> List[Dict]:
        # Generate query embedding
        query_embedding = self.embedding_service.encode(query).tolist()
        
        # Build filter
        filters = []
        if subject:
            filters.append({"term": {"subject": subject}})
        
        # Hybrid query
        es_query = {
            "query": {
                "script_score": {
                    "query": {
                        "bool": {
                            "should": [
                                {"match": {"title": {"query": query, "boost": 2.0}}},
                                {"match": {"content": query}},
                            ],
                            "filter": filters
                        }
                    },
                    "script": {
                        "source": """
                            double textScore = _score;
                            double vectorScore = cosineSimilarity(params.query_vector, 'embedding') + 1.0;
                            return (textScore * 0.3) + (vectorScore * 0.7);
                        """,
                        "params": {"query_vector": query_embedding}
                    }
                }
            },
            "size": limit,
            "highlight": {
                "fields": {
                    "title": {},
                    "content": {"fragment_size": 150}
                }
            }
        }
        
        response = await self.es.search(index="doubts", body=es_query)
        
        # Format results
        results = []
        for hit in response["hits"]["hits"]:
            results.append({
                "doubt_id": hit["_source"]["doubt_id"],
                "title": hit["_source"]["title"],
                "snippet": hit.get("highlight", {}).get("content", [""])[0],
                "score": hit["_score"],
                "highlights": hit.get("highlight", {})
            })
        
        return results
    
    async def find_similar(
        self, title: str, content: str, threshold: float = 0.85
    ) -> List[Dict]:
        """Find similar questions (duplicate detection)"""
        # Combine title and content for embedding
        combined_text = f"{title}. {content}"
        embedding = self.embedding_service.encode(combined_text).tolist()
        
        # Vector similarity search
        es_query = {
            "query": {
                "script_score": {
                    "query": {"match_all": {}},
                    "script": {
                        "source": "cosineSimilarity(params.query_vector, 'embedding')",
                        "params": {"query_vector": embedding}
                    }
                }
            },
            "size": 10,
            "min_score": threshold
        }
        
        response = await self.es.search(index="doubts", body=es_query)
        
        return [
            {
                "doubt_id": hit["_source"]["doubt_id"],
                "title": hit["_source"]["title"],
                "similarity": hit["_score"],
                "is_duplicate": hit["_score"] > 0.9
            }
            for hit in response["hits"]["hits"]
        ]
\`\`\`

#### 4. `app/services/chat_service.py`

\`\`\`python
from openai import AsyncOpenAI
from typing import List, Dict, Optional

class ChatService:
    def __init__(self):
        self.client = AsyncOpenAI()
        self.system_prompt = """You are Entropy AI, an educational assistant for STEM students. 
        Help students understand concepts, solve problems, and learn effectively. 
        Be encouraging, clear, and guide them to find solutions rather than giving direct answers."""
    
    async def chat(
        self,
        message: str,
        conversation_history: List[Dict],
        context: Optional[Dict] = None
    ) -> Dict:
        """Generate AI response"""
        
        # Build messages
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": message})
        
        # Add context if available
        if context:
            context_msg = f"User context: Subject={context.get('subject')}, Level={context.get('user_level')}"
            messages.insert(1, {"role": "system", "content": context_msg})
        
        # Call LLM
        response = await self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        return {
            "message": response.choices[0].message.content,
            "confidence": 0.9,  # Could calculate based on response
            "tokens_used": response.usage.total_tokens
        }
\`\`\`

#### 5. `app/api/routes.py`

\`\`\`python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from app.services.search_service import SearchService
from app.services.chat_service import ChatService
from app.core.elasticsearch import get_es_client

router = APIRouter()

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: str
    context: Optional[dict] = None

class SearchRequest(BaseModel):
    query: str
    subject: Optional[str] = None
    limit: int = 20
    search_type: str = "hybrid"

class IndexRequest(BaseModel):
    doubt_id: str
    title: str
    content: str
    subject: str
    tags: List[str]
    metadata: dict

# Endpoints
@router.post("/chat")
async def chat(request: ChatRequest):
    chat_service = ChatService()
    # Implementation
    pass

@router.post("/search")
async def search(request: SearchRequest, es = Depends(get_es_client)):
    search_service = SearchService(es)
    results = await search_service.search(
        query=request.query,
        subject=request.subject,
        limit=request.limit,
        search_type=request.search_type
    )
    return {"results": results}

@router.post("/index")
async def index_doubt(request: IndexRequest, es = Depends(get_es_client)):
    # Implementation
    pass

@router.post("/similar")
async def find_similar(request: dict, es = Depends(get_es_client)):
    search_service = SearchService(es)
    similar = await search_service.find_similar(
        title=request["title"],
        content=request["content"],
        threshold=request.get("threshold", 0.85)
    )
    return {"similar_questions": similar}
\`\`\`

#### 6. `requirements.txt`

\`\`\`txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
python-dotenv==1.0.0
elasticsearch==8.11.1
sentence-transformers==2.2.2
openai==1.10.0
anthropic==0.18.1
langchain==0.1.6
httpx==0.26.0
python-jose[cryptography]==3.3.0
redis==5.0.1
scikit-learn==1.4.0
numpy==1.26.3
pytest==7.4.4
pytest-asyncio==0.23.3
\`\`\`

---

## Deployment

### Docker Deployment

\`\`\`dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download ML model at build time
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application
COPY ./app ./app

# Expose port
EXPOSE 8000

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### Environment Variables

\`\`\`env
# .env
AI_BACKEND_TOKEN=your-secure-token
ELASTICSEARCH_URL=http://elasticsearch:9200
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
\`\`\`

### Deploy to Railway/Render

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Performance Optimization

1. **Caching**: Use Redis for frequently accessed embeddings
2. **Batch Processing**: Process multiple embeddings in parallel
3. **Model Quantization**: Use smaller model variants
4. **Connection Pooling**: Reuse Elasticsearch connections

---

## Next Steps for Implementation

1. **Phase 1: Core Search** (Week 1)
   - Set up FastAPI project
   - Integrate Elasticsearch
   - Implement embedding service
   - Build search endpoints

2. **Phase 2: Chat Integration** (Week 2)
   - Integrate OpenAI/Claude
   - Build conversation management
   - Add context awareness

3. **Phase 3: Recommendations** (Week 3)
   - Build recommendation engine
   - User profiling
   - Collaborative filtering

4. **Phase 4: Quality & Optimization** (Week 4)
   - Answer quality scoring
   - Performance tuning
   - Testing & deployment

---

## Testing

\`\`\`python
# tests/test_search.py
import pytest
from app.services.search_service import SearchService

@pytest.mark.asyncio
async def test_hybrid_search():
    search_service = SearchService(es_client)
    results = await search_service.search(
        query="integration by parts",
        subject="MATHEMATICS",
        limit=10
    )
    assert len(results) > 0
    assert all("doubt_id" in r for r in results)
\`\`\`

---

## Monitoring & Observability

1. **Metrics to Track**:
   - Response time per endpoint
   - Embedding generation time
   - Search relevance (click-through rate)
   - Token usage (for LLM calls)

2. **Tools**:
   - FastAPI built-in metrics
   - Prometheus + Grafana
   - Sentry for error tracking

---

This guide provides everything needed to build the AI Agent service. Feed this entire document to Claude or use it as a blueprint for implementation.
