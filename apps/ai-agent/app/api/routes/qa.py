"""
Q&A endpoint — now backed only by ChatService (Spark)
No agentic RAG, no langchain fallback. Clean + predictable.
"""

from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from pathlib import Path
from datetime import datetime
import logging
import json
import aiofiles

logger = logging.getLogger(__name__)
router = APIRouter()

# Local history storage
QA_STORAGE_PATH = Path("./data/qa_history")
QA_STORAGE_PATH.mkdir(parents=True, exist_ok=True)

# ---- ONLY service we use now ---- #
try:
    from app.services.chat_service import ChatService  # YOU SAID: use the tweaked ChatService only
    chat_service = ChatService()
    logger.info("ChatService loaded for QA endpoint.")
except Exception as e:
    logger.error("Failed to load ChatService: %s", e)
    chat_service = None


class QAInput(BaseModel):
    user_prompt: str = Field(..., description="Prompt from the user")
    system_prompt: Optional[str] = Field(default="You are a helpful AI tutor.", description="System instructions")


@router.get("/greeting")
async def get_greeting():
    return {"greeting": "Hi! I'm Spark ⚡ — your AI study buddy! Ask me anything!"}


@router.get("/health")
async def qa_health():
    return {
        "status": "healthy",
        "chat_service_available": bool(chat_service)
    }


# ------------------------------------------------------------
# FILE HANDLING + VECTOR STORE INGEST (optional but preserved)
# ------------------------------------------------------------

async def _save_upload_file(upload: UploadFile, dest_dir: Path) -> Path:
    dest_dir.mkdir(parents=True, exist_ok=True)
    target = dest_dir / upload.filename
    async with aiofiles.open(target, "wb") as out_f:
        await out_f.write(await upload.read())
    return target


async def _process_uploaded_files(file_paths: List[Path], collection_name: str):
    """
    Keep document ingestion support (for future RAG),
    but ChatService does NOT use these documents yet.
    """
    try:
        from app.services.langchain_service import langchain_service

        loaded = []
        from langchain_core.documents import Document
        from langchain_community.document_loaders import PyPDFLoader, TextLoader
        import docx2txt

        for fp in file_paths:
            try:
                if fp.suffix.lower() == ".pdf":
                    loader = PyPDFLoader(str(fp))
                    docs = loader.load()
                elif fp.suffix.lower() in (".txt", ".md"):
                    loader = TextLoader(str(fp))
                    docs = loader.load()
                elif fp.suffix.lower() in (".doc", ".docx"):
                    text = docx2txt.process(str(fp))
                    docs = [Document(page_content=text)]
                else:
                    text = fp.read_text(errors="ignore")
                    docs = [Document(page_content=text)]

                for d in docs:
                    if not d.metadata:
                        d.metadata = {}
                    d.metadata["source"] = fp.name

                loaded.extend(docs)
            except Exception:
                logger.exception("Failed to load: %s", fp)

        if loaded:
            chunks = langchain_service.split_documents(loaded)
            langchain_service.create_vector_store(chunks, collection_name)
            logger.info("Indexed %d chunks into '%s'", len(chunks), collection_name)

        return len(loaded)

    except Exception as e:
        logger.info("Vector store not available, skipping indexing. %s", e)
        return 0


# ------------------------------------------------------------
# MAIN Q&A ENDPOINT — NOW ChatService ONLY
# ------------------------------------------------------------

@router.post("/", summary="Post QA", response_description="AI response payload")
async def post_qa(payload: QAInput, request: Request):
    # Print the raw request body for debugging
    raw_body = await request.body()
    print("[QA][DEBUG] Raw request body:", raw_body)
    print("[QA][DEBUG] Parsed payload:", payload.dict())
    if not chat_service:
        raise HTTPException(503, "ChatService unavailable.")

    try:
        # Extract
        user_prompt = payload.user_prompt.strip()
        system_prompt = payload.system_prompt.strip() or "You are a helpful AI tutor."

        if not user_prompt:
            raise HTTPException(400, "user_prompt cannot be empty")

        if not system_prompt:
            raise HTTPException(400, "system_prompt cannot be empty")

        # ChatService call
        result = await chat_service.chat(
            user_id="anonymous",
            message=user_prompt,
            system_prompt=system_prompt
        )

        answer = result.response
        followups = result.follow_up_questions

        # Save
        qa_id = f"qa_{int(datetime.now().timestamp() * 1000)}"
        record = {
            "id": qa_id,
            "user_prompt": user_prompt,
            "system_prompt": system_prompt,
            "answer": answer,
            "followups": followups,
            "timestamp": datetime.now().isoformat(),
        }

        with open(QA_STORAGE_PATH / f"{qa_id}.json", "w", encoding="utf-8") as f:
            json.dump(record, f, indent=2)

        return {
            "answer": answer,
            "follow_up_questions": followups,
            "qaId": qa_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("QA request handling failed")
        raise HTTPException(500, f"Internal error: {str(e)}")
