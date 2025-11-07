"""
Q&A endpoint with bulletproof RAG (works with or without embeddings)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging
import json
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

# Storage path
QA_STORAGE_PATH = Path("./data/qa_history")
QA_STORAGE_PATH.mkdir(parents=True, exist_ok=True)

# Import langchain_service with detailed error tracking
print("=" * 80)
print("🔵 QA.PY: IMPORTING LANGCHAIN_SERVICE")
print("=" * 80)

langchain_service = None

try:
    from app.services.langchain_service import langchain_service as imported_service
    langchain_service = imported_service
    
    print(f"✅ Import successful")
    print(f"   langchain_service object: {langchain_service}")
    print(f"   Type: {type(langchain_service)}")
    print(f"   Is None: {langchain_service is None}")
    print("=" * 80)
    
    logger.info(f"✅ LangChain service imported in QA routes: {langchain_service is not None}")
except Exception as e:
    print("=" * 80)
    print(f"❌ IMPORT FAILED: {e}")
    print("=" * 80)
    logger.error(f"❌ Failed to import langchain_service: {e}")
    import traceback
    traceback.print_exc()
    langchain_service = None


class QARequest(BaseModel):
    question: str
    collection_name: str = "default"
    conversation_history: Optional[List[Dict[str, str]]] = None
    system_prompt: Optional[str] = None
    userId: Optional[str] = "anonymous"


class QAResponse(BaseModel):
    answer: str
    sources: List[Dict]
    mode: str
    qaId: str


class GreetingResponse(BaseModel):
    greeting: str


@router.get("/greeting")
async def get_greeting():
    """Get Spark's greeting"""
    logger.info("✅ Greeting endpoint called")
    return {
        "greeting": "Hi! I'm Spark ⚡ - your AI study buddy! Ask me anything or upload documents for deeper analysis!"
    }


from app.services.agentic_rag_service import agentic_rag_service


@router.post("/")
async def ask_question(request: QARequest):
    """Ask a question with AGENTIC RAG support"""
    try:
        print(f"🔍 QA POST: agentic_rag_service = {agentic_rag_service}")
        
        if not agentic_rag_service:
            logger.error("❌ Agentic RAG service not available")
            raise HTTPException(status_code=503, detail="AI service not available")
        
        logger.info(f"📨 Q&A request: {request.question[:50]}...")
        
        # Use agentic RAG workflow
        result = await agentic_rag_service.process_question(
            question=request.question,
            collection_name=request.collection_name
        )
        
        logger.info(f"✅ Response generated via {result.get('mode', 'unknown')}")
        
        # Create record
        qa_id = f"qa_{int(datetime.now().timestamp() * 1000)}"
        qa_record = {
            "id": qa_id,
            "userId": request.userId,
            "question": request.question,
            "answer": result["answer"],
            "sources": result.get("sources", []),
            "mode": result.get("mode", "direct"),
            "workflow_info": result.get("workflow_info", {}),
            "collection_name": request.collection_name,
            "system_prompt": request.system_prompt,
            "timestamp": datetime.now().isoformat(),
        }
        
        # Store
        try:
            qa_file = QA_STORAGE_PATH / f"{qa_id}.json"
            with open(qa_file, 'w', encoding='utf-8') as f:
                json.dump(qa_record, f, indent=2, ensure_ascii=False)
            logger.info(f"💾 Stored: {qa_id}")
        except Exception as e:
            logger.warning(f"Storage failed: {e}")
        
        return {
            "answer": result["answer"],
            "sources": result.get("sources", []),
            "mode": result.get("mode", "direct"),
            "qaId": qa_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Q&A error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{user_id}")
async def get_qa_history(user_id: str, limit: int = 20):
    """Get Q&A history"""
    try:
        history = []
        for qa_file in sorted(QA_STORAGE_PATH.glob("*.json"), reverse=True):
            try:
                with open(qa_file, 'r', encoding='utf-8') as f:
                    record = json.load(f)
                    if record.get("userId") == user_id or user_id == "all":
                        history.append(record)
                        if len(history) >= limit:
                            break
            except Exception as e:
                logger.warning(f"Error reading {qa_file}: {e}")
        
        return {"history": history, "count": len(history)}
    except Exception as e:
        logger.error(f"History error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def qa_health():
    """Health check"""
    return {
        "status": "healthy",
        "endpoint": "qa",
        "langchain_available": langchain_service is not None,
        "langchain_type": str(type(langchain_service)),
        "langchain_value": str(langchain_service)
    }


print("=" * 80)
print(f"✅ QA ROUTES MODULE LOADED")
print(f"   Final langchain_service: {langchain_service}")
print("=" * 80)
logger.info("✅ QA routes module loaded successfully")
