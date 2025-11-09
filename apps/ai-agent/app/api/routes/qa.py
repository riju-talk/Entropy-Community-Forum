"""
Q&A endpoint with bulletproof RAG (works with or without embeddings)
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
import json
from pathlib import Path
from datetime import datetime
import aiofiles

# LangChain imports (document classes only; actual runtime services are separate)
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader
import docx2txt

logger = logging.getLogger(__name__)
router = APIRouter()

# Storage path
QA_STORAGE_PATH = Path("./data/qa_history")
QA_STORAGE_PATH.mkdir(parents=True, exist_ok=True)

# Safely import runtime services (langchain_service, agentic_rag_service)
langchain_service = None
agentic_rag_service = None

try:
    from app.services.langchain_service import langchain_service as imported_service  # type: ignore
    langchain_service = imported_service
    logger.debug("Imported langchain_service successfully")
except Exception as e:
    logger.warning("Could not import langchain_service: %s", e, exc_info=True)
    langchain_service = None

try:
    from app.services.agentic_rag_service import agentic_rag_service as imported_agentic  # type: ignore
    agentic_rag_service = imported_agentic
    logger.debug("Imported agentic_rag_service successfully")
except Exception:
    logger.info("agentic_rag_service not available; will fallback to langchain_service if present")
    agentic_rag_service = None


class QARequest(BaseModel):
    question: str
    collection_name: str = "default"
    conversation_history: Optional[List[Dict[str, str]]] = None
    system_prompt: Optional[str] = None
    userId: Optional[str] = "anonymous"


class QAResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    mode: str
    qaId: str


class GreetingResponse(BaseModel):
    greeting: str


@router.get("/greeting", response_model=GreetingResponse)
async def get_greeting():
    """Get Spark's greeting"""
    return {"greeting": "Hi! I'm Spark ⚡ - your AI study buddy! Ask me anything or upload documents for deeper analysis!"}


@router.get("/health")
async def qa_health():
    """Health check for QA"""
    return {
        "status": "healthy",
        "endpoint": "qa",
        "agentic_rag_available": agentic_rag_service is not None,
        "langchain_available": langchain_service is not None,
    }


@router.get("/history/{user_id}")
async def get_qa_history(user_id: str, limit: int = 20):
    """Get Q&A history for a user (or 'all')"""
    try:
        history = []
        for qa_file in sorted(QA_STORAGE_PATH.glob("*.json"), reverse=True):
            try:
                with open(qa_file, "r", encoding="utf-8") as f:
                    record = json.load(f)
                    if user_id == "all" or record.get("userId") == user_id:
                        history.append(record)
                        if len(history) >= limit:
                            break
            except Exception:
                logger.warning("Failed reading QA file %s", qa_file, exc_info=True)
        return {"history": history, "count": len(history)}
    except Exception as e:
        logger.error("History error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to read history")


def _load_docx(file_path: str) -> List[Document]:
    text = docx2txt.process(file_path)
    return [Document(page_content=text, metadata={"source": Path(file_path).name})]


async def _save_uploaded_file(upload: UploadFile, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    target = dest_dir / upload.filename
    async with aiofiles.open(target, "wb") as out_f:
        content = await upload.read()
        await out_f.write(content)
    return target


async def _process_uploaded_files(file_paths: List[Path], collection_name: str):
    documents: List[Document] = []
    for fp in file_paths:
        suffix = fp.suffix.lower()
        try:
            if suffix == ".pdf":
                loader = PyPDFLoader(str(fp))
                docs = loader.load()
                for d in docs:
                    d.metadata = getattr(d, "metadata", {}) or {}
                    d.metadata["source"] = fp.name
                documents.extend(docs)
            elif suffix in (".txt", ".md"):
                loader = TextLoader(str(fp), encoding="utf-8")
                docs = loader.load()
                for d in docs:
                    d.metadata = getattr(d, "metadata", {}) or {}
                    d.metadata["source"] = fp.name
                documents.extend(docs)
            elif suffix in (".doc", ".docx"):
                docs = _load_docx(str(fp))
                documents.extend(docs)
            else:
                # fallback: read as text
                with open(fp, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                documents.append(Document(page_content=content, metadata={"source": fp.name}))
        except Exception:
            logger.exception("Failed to load file %s", fp)
            continue

    if documents and langchain_service:
        split_docs = langchain_service.split_documents(documents)
        langchain_service.create_vector_store(split_docs, collection_name)
        logger.info("Created/updated vector store '%s' with %d chunks", collection_name, len(split_docs))
    return len(documents)


@router.post("/qa", response_model=QAResponse)
async def post_qa(
    request: Request,
    question: Optional[str] = Form(None),
    system_prompt: Optional[str] = Form(None),
    collection_name: Optional[str] = Form("default"),
    files: Optional[List[UploadFile]] = File(None),
):
    """
    Accepts:
      - JSON body: { question, system_prompt, collection_name, conversation_history?, userId? }
      - multipart/form-data with fields question, system_prompt, collection_name and files[]
    Processes optional files into the collection, then runs the RAG/chat workflow.
    """
    try:
        # Parse JSON body if form field not used
        conversation_history = None
        user_id = "anonymous"
        if question is None:
            try:
                body = await request.json()
                question = body.get("question") or body.get("prompt") or body.get("q")
                system_prompt = system_prompt or body.get("system_prompt")
                collection_name = body.get("collection_name") or collection_name
                conversation_history = body.get("conversation_history")
                user_id = body.get("userId") or user_id
            except Exception:
                # If no JSON body, proceed (question may still be provided via form)
                pass

        if not question:
            raise HTTPException(status_code=400, detail="Missing 'question' field")

        # Handle file uploads (if any)
        saved_paths: List[Path] = []
        if files:
            upload_dir = Path("./data/uploads")
            for up in files:
                target = await _save_uploaded_file(up, upload_dir)
                saved_paths.append(target)
                logger.debug("Saved upload: %s", target)
            # Process and add to collection
            await _process_uploaded_files(saved_paths, collection_name)

        # Choose processing service: prefer agentic_rag_service when available
        result: Dict[str, Any]
        if agentic_rag_service:
            result = await agentic_rag_service.process_question(
                question=question,
                collection_name=collection_name,
                conversation_history=conversation_history,
                system_prompt=system_prompt,
                user_id=user_id,
            )
        elif langchain_service:
            result = await langchain_service.chat_with_fallback(
                message=question,
                collection_name=collection_name or "default",
                conversation_history=conversation_history,
                system_prompt=system_prompt,
            )
        else:
            logger.error("No AI service available to process question")
            raise HTTPException(status_code=503, detail="AI service not available")

        answer = result.get("answer", "")
        sources = result.get("sources", [])
        mode = result.get("mode", "direct")

        # Create and persist QA record
        qa_id = f"qa_{int(datetime.now().timestamp() * 1000)}"
        qa_record = {
            "id": qa_id,
            "userId": user_id,
            "question": question,
            "answer": answer,
            "sources": sources,
            "mode": mode,
            "workflow_info": result.get("workflow_info", {}),
            "collection_name": collection_name,
            "system_prompt": system_prompt,
            "timestamp": datetime.now().isoformat(),
        }
        try:
            qa_file = QA_STORAGE_PATH / f"{qa_id}.json"
            with open(qa_file, "w", encoding="utf-8") as f:
                json.dump(qa_record, f, indent=2, ensure_ascii=False)
            logger.debug("Stored QA record %s", qa_id)
        except Exception:
            logger.exception("Failed to store QA record %s", qa_id)

        return {"answer": answer, "sources": sources, "mode": mode, "qaId": qa_id}

    except HTTPException:
        raise
    except Exception:
        logger.exception("QA processing failed", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process QA request")

# End of QA routes module
