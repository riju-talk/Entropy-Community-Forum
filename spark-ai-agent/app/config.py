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
