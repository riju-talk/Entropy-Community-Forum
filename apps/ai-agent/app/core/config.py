"""
Configuration management for the AI Agent using LangChain
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import field_validator
import logging

logger = logging.getLogger(__name__)

# Print current working directory for debugging
print(f"🔍 Current Working Directory: {os.getcwd()}")
print(f"🔍 Config module location: {__file__}")

# Get the directory where this config.py file is located
CONFIG_DIR = Path(__file__).parent
APP_DIR = CONFIG_DIR.parent
AI_AGENT_DIR = APP_DIR.parent
ENV_FILE_PATH = AI_AGENT_DIR / ".env"

print(f"🔍 Looking for .env file at: {ENV_FILE_PATH}")
print(f"🔍 .env file exists: {ENV_FILE_PATH.exists()}")

if ENV_FILE_PATH.exists():
    print(f"✅ Found .env file at: {ENV_FILE_PATH}")
else:
    print(f"⚠️  .env file NOT found at: {ENV_FILE_PATH}")
    print(f"📝 Please create .env file at: {ENV_FILE_PATH}")


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Keys
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"  # Updated default model
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database Configuration
    database_url: str = ""
    
    # LangChain Configuration
    langchain_tracing_v2: bool = False
    langchain_api_key: str = ""
    langchain_project: str = "entropy-ai-agent"
    
    # Vector Store Configuration
    vector_store_path: str = "./data/vector_store"
    embeddings_model: str = "ggml-all-MiniLM-L6-v2-f16.gguf"  # GPT4All model
    embeddings_device: str = "cpu"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # Logging
    log_level: str = "INFO"
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"
    
    @field_validator('allowed_origins', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        """Parse allowed_origins from comma-separated string"""
        if isinstance(v, str):
            return v
        return v
    
    def get_allowed_origins_list(self):
        """Get allowed origins as a list"""
        if isinstance(self.allowed_origins, str):
            return [origin.strip() for origin in self.allowed_origins.split(',') if origin.strip()]
        return self.allowed_origins
    
    class Config:
        env_file = str(ENV_FILE_PATH)
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env


# Create settings instance
print(f"📦 Loading environment variables from: {ENV_FILE_PATH}")
settings = Settings()

# Print loaded configuration (without sensitive data)
print(f"⚙️  Loaded Configuration:")
print(f"   - GROQ_API_KEY: {'✅ Set' if settings.groq_api_key and settings.groq_api_key != 'your_groq_api_key_here' else '❌ Not set'}")
print(f"   - GROQ_MODEL: {settings.groq_model}")
print(f"   - HOST: {settings.host}")
print(f"   - PORT: {settings.port}")
print(f"   - DATABASE_URL: {'✅ Set' if settings.database_url else '❌ Not set'}")
if settings.database_url:
    # Show database info without password
    from urllib.parse import urlparse
    parsed = urlparse(settings.database_url)
    db_info = f"{parsed.scheme}://{parsed.username}@{parsed.hostname}:{parsed.port}{parsed.path}"
    print(f"   - Database: {db_info}")
print(f"   - ALLOWED_ORIGINS: {settings.get_allowed_origins_list()}")
print(f"   - LOG_LEVEL: {settings.log_level}")


def validate_settings():
    """Validate that all required settings are present"""
    errors = []
    warnings = []
    
    if not settings.groq_api_key or settings.groq_api_key == "your_groq_api_key_here":
        errors.append("⚠️  GROQ_API_KEY is not set or invalid. Get a free key from https://console.groq.com")
    
    if not settings.database_url:
        warnings.append("⚠️  DATABASE_URL is not set. Chat history will not be persisted.")
    elif 'pgbouncer' in settings.database_url.lower():
        warnings.append("⚠️  DATABASE_URL contains 'pgbouncer' parameter which will be removed for compatibility")
    
    if warnings:
        print("⚠️  Configuration Warnings:")
        for warning in warnings:
            print(f"   {warning}")
    
    if errors:
        error_msg = "\n".join(errors)
        raise ValueError(f"Configuration errors:\n{error_msg}")
    
    print("✅ Required configuration settings are valid")
    return True
