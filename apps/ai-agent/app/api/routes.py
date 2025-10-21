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
