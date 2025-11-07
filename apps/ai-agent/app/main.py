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
from datetime import datetime
import os

# Import with error handling
try:
    from app.config import settings
    from app.api.routes import router
    from app.core.vector_store import init_vector_store
    from app.utils.logger import setup_logger
    
    logger = setup_logger(__name__)
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    print("\nPlease check your .env file and ensure all required settings are correct.")
    print("Copy .env.example to .env and configure it properly.")
    import sys
    sys.exit(1)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent study assistant for Entropy platform",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else [settings.ALLOWED_ORIGINS],
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
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"📊 Groq API configured: {bool(settings.GROQ_API_KEY or os.getenv('GROQ_API_KEY'))}")

    # Initialize vector store
    try:
        init_vector_store()
        logger.info("✅ Vector store initialized")
    except Exception as e:
        logger.error(f"❌ Vector store initialization failed: {e}")

    logger.info("✅ Server ready!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 Shutting down...")

# Include API routes
app.include_router(router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "functions": [
            "qa",
            "chat",
            "flashcards",
            "quiz",
            "mindmap"
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    
    return {
        "status": "healthy" if groq_key else "degraded",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "groq": bool(groq_key),
            "embeddings": settings.EMBEDDING_MODEL,
            "vector_store": "chromadb"
        },
        "message": "AI Agent operational" if groq_key else "GROQ_API_KEY not configured"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
