"""
Q&A endpoint with bulletproof RAG (works with or without embeddings)
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
import logging
import json
import aiofiles

logger = logging.getLogger(__name__)
router = APIRouter()

# Storage for simple QA history files
QA_STORAGE_PATH = Path("./data/qa_history")
QA_STORAGE_PATH.mkdir(parents=True, exist_ok=True)

# Try to import optional runtime services
langchain_service = None
agentic_rag_service = None
try:
    from app.services.langchain_service import langchain_service as imported_langchain  # type: ignore
    langchain_service = imported_langchain
    logger.debug("Imported langchain_service")
except Exception as e:
    logger.info("langchain_service not available: %s", e)

try:
    from app.services.agentic_rag_service import agentic_rag_service as imported_agentic  # type: ignore
    agentic_rag_service = imported_agentic
    logger.debug("Imported agentic_rag_service")
except Exception as e:
    logger.info("agentic_rag_service not available: %s", e)


class QARequest(BaseModel):
    question: str
    collection_name: Optional[str] = "default"
    conversation_history: Optional[List[Dict[str, str]]] = None
    system_prompt: Optional[str] = None
    userId: Optional[str] = "anonymous"


@router.get("/greeting")
async def get_greeting():
    """Public greeting for QA"""
    return JSONResponse({"greeting": "Hi! I'm Spark ⚡ - your AI study buddy! Ask me anything or upload documents for deeper analysis!"})


@router.get("/health")
async def qa_health():
    """Health check for QA router and availability of services"""
    return JSONResponse({
        "status": "healthy",
        "agentic_rag_available": bool(agentic_rag_service),
        "langchain_available": bool(langchain_service)
    })


@router.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 20):
    """Return stored QA history files (local file-based storage)."""
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
                logger.exception("Failed reading QA file %s", qa_file)
                continue
        return {"history": history, "count": len(history)}
    except Exception as e:
        logger.exception("History error: %s", e)
        raise HTTPException(status_code=500, detail="Failed to read history")


async def _save_upload_file(upload: UploadFile, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    target = dest_dir / upload.filename
    async with aiofiles.open(target, "wb") as out_f:
        content = await upload.read()
        await out_f.write(content)
    return target


async def _process_uploaded_files(file_paths: List[Path], collection_name: str):
    """
    Lightweight processing: load files into langchain_service if available.
    Returns number of documents processed.
    """
    documents_count = 0
    if not langchain_service:
        logger.info("langchain_service not available, skipping indexing")
        return documents_count

    from langchain_core.documents import Document  # type: ignore
    from langchain_community.document_loaders import PyPDFLoader, TextLoader  # type: ignore
    import docx2txt

    loaded_docs = []
    for fp in file_paths:
        try:
            suffix = fp.suffix.lower()
            if suffix == ".pdf":
                loader = PyPDFLoader(str(fp))
                docs = loader.load()
            elif suffix in (".txt", ".md"):
                loader = TextLoader(str(fp), encoding="utf-8")
                docs = loader.load()
            elif suffix in (".doc", ".docx"):
                text = docx2txt.process(str(fp))
                docs = [Document(page_content=text, metadata={"source": fp.name})]
            else:
                text = fp.read_text(encoding="utf-8", errors="ignore")
                docs = [Document(page_content=text, metadata={"source": fp.name})]

            for d in docs:
                if not getattr(d, "metadata", None):
                    d.metadata = {}
                d.metadata["source"] = fp.name
            loaded_docs.extend(docs)
        except Exception:
            logger.exception("Failed to load file %s", fp)
            continue

    if loaded_docs:
        split_docs = langchain_service.split_documents(loaded_docs)
        langchain_service.create_vector_store(split_docs, collection_name)
        documents_count = len(split_docs)
        logger.info("Created/updated vector store '%s' with %d chunks", collection_name, documents_count)

    return documents_count


@router.post("/")
async def post_qa(
    request: Request,
    question: Optional[str] = Form(None),
    system_prompt: Optional[str] = Form(None),
    collection_name: Optional[str] = Form("default"),
    files: Optional[List[UploadFile]] = File(None),
):
    """
    Main QA endpoint.
    Accepts either:
      - multipart/form-data with 'question' and files[]
      - JSON body with fields: question, system_prompt, collection_name, conversation_history, userId
    Returns JSON: {"answer": "...", "sources": [...], "mode": "rag"|"direct", "qaId": "..."
    """
    try:
        # parse JSON body if question not provided as form
        conversation_history = None
        user_id = "anonymous"
        if question is None:
            try:
                body = await request.json()
                question = body.get("question") or body.get("prompt") or body.get("q")
                system_prompt = system_prompt or body.get("system_prompt") or body.get("systemPrompt")
                collection_name = body.get("collection_name") or body.get("collectionName") or collection_name
                conversation_history = body.get("conversation_history") or body.get("conversationHistory")
                user_id = body.get("userId") or body.get("user_id") or user_id
            except Exception:
                # ignore parse errors here; will validate question later
                pass

        if not question:
            raise HTTPException(status_code=400, detail="Missing 'question' field")

        # Handle file uploads
        saved_paths = []
        if files:
            upload_dir = Path("./data/uploads")
            for up in files:
                target = await _save_upload_file(up, upload_dir)
                saved_paths.append(target)
                logger.debug("Saved upload: %s", target)
            # process into collection
            await _process_uploaded_files(saved_paths, collection_name)

        # Select processing: prefer agentic_rag_service if present
        result: Dict[str, Any]
        if agentic_rag_service:
            # agentic_rag_service may accept lightweight args; keep call minimal
            result = await agentic_rag_service.process_question(question=question, collection_name=collection_name, user_id=user_id)
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

        # Persist QA record for history
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
    except Exception as e:
        logger.exception("QA processing failed", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process QA request: {str(e)}")
