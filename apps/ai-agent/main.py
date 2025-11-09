"""
AI Agent Backend - FastAPI Application
Uses ChatGroq (free), GPT4All embeddings (free), and ChromaDB (local)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers from app.api.routes
from app.api.routes import documents, qa, mindmap, quiz, flashcards

app = FastAPI(
    title="Entropy AI Agent",
    description="AI-powered learning tools backend",
    version="1.0.0"
)

# CORS configuration - Allow all origins for development (use strict list in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(qa.router, prefix="/api", tags=["Q&A"])
app.include_router(mindmap.router, prefix="/api", tags=["Mind Mapping"])
app.include_router(quiz.router, prefix="/api", tags=["Quiz"])
app.include_router(flashcards.router, prefix="/api", tags=["Flashcards"])

@app.get("/")
async def root():
    return {
        "message": "Entropy AI Agent Backend",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "qa": "/api/qa",
            "documents_upload": "/api/documents/upload",
            "mindmap": "/api/mindmap",
            "quiz": "/api/quiz",
            "flashcards": "/api/flashcards"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for frontend"""
    groq_key = os.getenv("GROQ_API_KEY")
    
    return {
        "status": "healthy" if groq_key else "degraded",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "groq": bool(groq_key),
            "embeddings": "gpt4all",
            "vector_store": "chromadb"
        },
        "message": "AI Agent is operational" if groq_key else "GROQ_API_KEY not configured"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
