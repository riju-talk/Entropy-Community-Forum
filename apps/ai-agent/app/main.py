"""
Main FastAPI application for AI Agent
"""
import os
import sys
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import logging
import traceback

# Print startup information
print("=" * 80)
print("🚀 ENTROPY AI AGENT STARTING...")
print("=" * 80)
print(f"🔍 Python Version: {sys.version}")
print(f"🔍 Python Executable: {sys.executable}")
print(f"🔍 Current Working Directory: {os.getcwd()}")
print(f"🔍 Main module location: {__file__}")
print("=" * 80)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    from app.core.config import settings, validate_settings
    
    # Validate configuration
    validate_settings()
    logger.info("✅ Configuration loaded and validated successfully")
    
    # Note: Database is deprecated - using LangChain services
    logger.info("ℹ️  Using LangChain for all storage (vector stores + file-based history)")
    
except Exception as e:
    logger.error(f"❌ Startup Error: {e}")
    traceback.print_exc()
    raise

# Create FastAPI app
app = FastAPI(
    title="Entropy AI Agent",
    description="AI-powered learning assistant with RAG",
    version="1.0.0"
)

# Load environment variable and build allowed origins list
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if _allowed_origins_env:
    # split on commas, strip whitespace, ignore empty strings
    allowed_origins = [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]
else:
    # fallback for development only - keep localhosts
    allowed_origins = ["http://localhost:3000", "http://localhost:5000", "https://entropy-communtiy.netlify.app"]

# If a single asterisk present, treat as wildcard
if any(o == "*" for o in allowed_origins):
    cors_origins = ["*"]
else:
    cors_origins = allowed_origins

# Provide informative logging
logger.info("CORS allowed origins: %s", cors_origins)

# CORS configuration using allowed origins from environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include individual route modules
logger.info("📦 Loading API routes...")

# Create API router
api_router = APIRouter()

# QA routes (PRIMARY - replaces chat)
try:
    from app.api.routes.qa import router as qa_router
    api_router.include_router(qa_router, prefix="/qa", tags=["qa"])
    logger.info("✅ Q&A routes loaded at /api/qa (PRIMARY endpoint)")
except Exception as e:
    logger.error(f"❌ Failed to load Q&A routes: {e}")
    traceback.print_exc()

# Document routes
try:
    from app.api.routes.documents import router as documents_router
    api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
    logger.info("✅ Document routes loaded at /api/documents")
except Exception as e:
    logger.error(f"❌ Failed to load document routes: {e}")
    traceback.print_exc()

# Quiz routes
try:
    from app.api.routes.quiz import router as quiz_router
    api_router.include_router(quiz_router, prefix="/quiz", tags=["quiz"])
    logger.info("✅ Quiz routes loaded at /api/quiz")
except Exception as e:
    logger.error(f"❌ Failed to load quiz routes: {e}")
    traceback.print_exc()

# Flashcards routes
try:
    from app.api.routes.flashcards import router as flashcards_router
    api_router.include_router(flashcards_router, prefix="/flashcards", tags=["flashcards"])
    logger.info("✅ Flashcards routes loaded at /api/flashcards")
except Exception as e:
    logger.error(f"❌ Failed to load flashcards routes: {e}")
    traceback.print_exc()

# Mindmap routes
try:
    from app.api.routes.mindmap import router as mindmap_router
    api_router.include_router(mindmap_router, prefix="/mindmap", tags=["mindmap"])
    logger.info("✅ Mindmap routes loaded at /api/mindmap")
except Exception as e:
    logger.error(f"❌ Failed to load mindmap routes: {e}")
    traceback.print_exc()

# Chat routes (DEPRECATED - kept for compatibility)
try:
    from app.api.routes.chat import router as chat_router
    api_router.include_router(chat_router, prefix="/chat", tags=["chat (deprecated)"])
    logger.info("⚠️  Chat routes loaded (DEPRECATED - use /api/qa)")
except Exception as e:
    logger.error(f"❌ Failed to load chat routes: {e}")

# Include the API router with /api prefix
app.include_router(api_router, prefix="/api")
logger.info("✅ All routes mounted under /api prefix")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Entropy AI Agent is running",
        "version": "1.0.0",
        "status": "healthy",
        "cwd": os.getcwd(),
        "config_loaded": True,
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "qa": "/api/qa",
            "qa_greeting": "/api/qa/greeting",
            "documents": "/api/documents",
            "quiz": "/api/quiz",
            "flashcards": "/api/flashcards",
            "mindmap": "/api/mindmap",
            "chat_deprecated": "/api/chat"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "groq_configured": bool(settings.groq_api_key and settings.groq_api_key != "your_groq_api_key_here"),
        "cwd": os.getcwd(),
        "python_version": sys.version,
        "groq_model": settings.groq_model,
        "embeddings": "GPT4All (local)",
        "vector_store": "Chroma"
    }


@app.on_event("startup")
async def startup_event():
    """Log startup information and registered routes"""
    logger.info("=" * 80)
    logger.info("🎉 ENTROPY AI AGENT STARTED SUCCESSFULLY!")
    logger.info("=" * 80)
    logger.info(f"📍 Server: http://{settings.host}:{settings.port}")
    logger.info(f"📚 API Docs: http://{settings.host}:{settings.port}/docs")
    logger.info(f"📚 Registered Routes:")
    
    # Log all routes
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = ','.join(sorted(route.methods)) if route.methods else 'ANY'
            logger.info(f"   {methods:8} {route.path}")
    
    logger.info(f"")
    logger.info(f"🎯 Primary Endpoints:")
    logger.info(f"   GET  /api/qa/greeting - Get Spark greeting")
    logger.info(f"   POST /api/qa - Ask questions (RAG + fallback)")
    logger.info(f"   POST /api/documents/upload - Upload docs for RAG")
    logger.info(f"   POST /api/quiz - Generate quiz")
    logger.info(f"   POST /api/mindmap - Generate diagrams")
    logger.info(f"   POST /api/flashcards - Generate flashcards")
    logger.info(f"")
    logger.info(f"🔧 Configuration:")
    logger.info(f"   Groq Model: {settings.groq_model}")
    logger.info(f"   Embeddings: GPT4All (local & free)")
    logger.info(f"   Storage: LangChain Chroma + file-based Q&A history")
    logger.info("=" * 80)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
