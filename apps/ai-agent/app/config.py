"""
Configuration management for Spark AI Agent
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import List, Optional, Union
import os
from pathlib import Path
from dotenv import load_dotenv

# First try to load .env.local from the ai-agent directory
try:
    current_dir = Path(__file__).resolve().parent.parent
    local_env = current_dir / ".env.local"
    if local_env.exists():
        load_dotenv(local_env)
    else:
        # Fallback: try to find .env in parent directories
        current = current_dir
        for _ in range(6):  # up to repo root depth
            candidate = current / ".env"
            if candidate.exists():
                load_dotenv(candidate)
                break
            if current.parent == current:
                break
            current = current.parent
except Exception:
    # If anything goes wrong, continue; BaseSettings will still read process env
    pass

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Spark AI Agent"
    DEBUG: bool = False
    VERSION: str = "1.0.0"

    # API Configuration
    # Optional so the app can start in development without every secret present.
    AI_BACKEND_TOKEN: Optional[str] = None
    # When running locally the Next.js app in this monorepo is served on 3000
    # but in our docker-compose mapping we expose Next on 5000. Keep localhost
    # default but include both origins in ALLOWED_ORIGINS below.
    AI_BACKEND_URL: str = "http://localhost:3000"

    # LLM Configuration
    # Allow missing key during local development; services should handle absence
    # of an API key and return a helpful error at runtime if required.
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")  # API key for Groq LLM service
    LLM_MODEL: str = "mixtral-8x7b-32768"  # Default to Mixtral model
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 1000

    # Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Fireworks removed (using local embeddings)

    # Vector Store
    CHROMA_PERSIST_DIR: str = "./data/chroma_db"

    # File Upload
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".txt"]

    @model_validator(mode='before')
    def parse_allowed_file_types(cls, values):
        """Parse ALLOWED_FILE_TYPES from string or list."""
        file_types = values.get('ALLOWED_FILE_TYPES')
        if isinstance(file_types, str):
            try:
                # Handle JSON string array
                import json
                values['ALLOWED_FILE_TYPES'] = json.loads(file_types)
            except json.JSONDecodeError:
                # Handle comma-separated string
                values['ALLOWED_FILE_TYPES'] = [ext.strip() for ext in file_types.split(",")]
        return values

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        env_file_encoding='utf-8'
    )

    # CORS
    # Include the ports commonly used by the frontend in this monorepo.
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5000"]

    # Credit Costs
    CHAT_SHORT_COST: float = 1.0
    CHAT_LONG_COST: float = 2.0
    FLASHCARD_COST: float = 3.0
    QUIZ_COST: float = 4.0
    MINDMAP_COST: float = 2.5

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 30

    # Web Search removed (no Tavily)

settings = Settings()

# Create necessary directories
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Friendly warnings for missing optional configuration during development
try:
    # Avoid importing logger here to keep config lightweight
    if not settings.AI_BACKEND_TOKEN:
        print("[warn] AI_BACKEND_TOKEN is not set. Certain protected endpoints may fail until this is configured.")
    if not settings.OPENAI_API_KEY:
        print("[warn] OPENAI_API_KEY is not set. LLM functionality will be disabled until an API key is provided.")
except Exception:
    # Best-effort only; don't raise during import
    pass
