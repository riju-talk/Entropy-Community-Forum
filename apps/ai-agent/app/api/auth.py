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
    # If no token is configured for the backend, skip verification (development mode)
    if not settings.AI_BACKEND_TOKEN:
        # Accept any provided token or none
        return credentials.credentials if credentials else ""

    token = credentials.credentials

    if token != settings.AI_BACKEND_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token
