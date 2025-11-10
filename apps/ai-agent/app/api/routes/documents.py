"""
Document upload and RAG query endpoints using LangChain directly
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from pydantic import BaseModel
from typing import Optional, List
import logging
import aiofiles
from pathlib import Path
import shutil
import uuid
import os

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader
import docx2txt

from app.services.langchain_service import langchain_service
from app.core.auth import verify_secret

logger = logging.getLogger(__name__)
router = APIRouter()

# Config
UPLOAD_DIR = Path("./data/uploads")
VECTOR_STORE_ROOT = Path("./data/chroma_db")
ALLOWED_EXT = {".pdf", ".txt", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_FILES_PER_UPLOAD = 10

# Safe helper to ensure directories exist
def _ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

# Save UploadFile to disk
async def _save_upload_file(upload: UploadFile, dest: Path) -> Path:
    _ensure_dir(dest.parent)
    with open(dest, "wb") as out_f:
        content = await upload.read()
        out_f.write(content)
    return dest

# Determine loader type by extension (defer actual loader logic to langchain_service)
def _is_allowed_file(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXT


@router.post("/upload", dependencies=[Depends(verify_secret)])
async def upload_documents(
    request: Request,
    files: Optional[List[UploadFile]] = File(None),
    collection_name: str = Form("default"),
    user_id: Optional[str] = Form(None),
):
    """
    Upload documents for RAG processing.
    - files: list of files (pdf/txt/doc/docx)
    - collection_name: collection under which to store vectors (default 'default')
    - user_id: optional user identifier (for metadata)
    """
    try:
        logger.info("[DOCUMENTS] Upload requested: collection=%s user_id=%s", collection_name, user_id)

        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files uploaded")

        if len(files) > MAX_FILES_PER_UPLOAD:
            raise HTTPException(status_code=400, detail=f"Too many files uploaded. Max {MAX_FILES_PER_UPLOAD} allowed")

        saved_paths = []
        filenames = []
        # Validate and save files
        upload_collection_dir = UPLOAD_DIR / collection_name
        _ensure_dir(upload_collection_dir)

        for f in files:
            if not _is_allowed_file(f.filename):
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {f.filename}")
            # Check size by reading but avoid re-reading large file twice; we already have content in UploadFile.read
            content = await f.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail=f"File too large: {f.filename}")
            # write to disk
            target_path = upload_collection_dir / f"{uuid.uuid4().hex}_{Path(f.filename).name}"
            with open(target_path, "wb") as out_f:
                out_f.write(content)
            saved_paths.append(target_path)
            filenames.append(Path(f.filename).name)
            logger.info("[DOCUMENTS] Saved upload: %s (%d bytes)", str(target_path), target_path.stat().st_size)
            # reset file if needed (we already consumed it)

        # Process documents: use langchain_service if available
        # This module assumes there is a langchain_service with split_documents and create_vector_store
        try:
            from app.services.langchain_service import langchain_service  # type: ignore
        except Exception as e:
            langchain_service = None
            logger.warning("[DOCUMENTS] langchain_service not available: %s", e)

        created_doc_ids = []
        if langchain_service:
            # Load and convert files into langchain Document objects using langchain loaders if available
            docs_for_indexing = []
            for path in saved_paths:
                suffix = path.suffix.lower()
                try:
                    if suffix == ".pdf":
                        try:
                            from langchain_community.document_loaders import PyPDFLoader  # type: ignore
                            loader = PyPDFLoader(str(path))
                            loaded = loader.load()
                        except Exception:
                            # fallback plaintext read
                            loaded = [type("D", (), {"page_content": path.read_text(encoding="utf-8", errors="ignore"), "metadata": {"source": path.name}})()]
                    elif suffix in {".txt", ".md"}:
                        try:
                            from langchain_community.document_loaders import TextLoader  # type: ignore
                            loader = TextLoader(str(path), encoding="utf-8")
                            loaded = loader.load()
                        except Exception:
                            loaded = [type("D", (), {"page_content": path.read_text(encoding="utf-8", errors="ignore"), "metadata": {"source": path.name}})()]
                    elif suffix in {".docx", ".doc"}:
                        # use docx2txt as basic fallback
                        try:
                            import docx2txt  # type: ignore
                            txt = docx2txt.process(str(path))
                            loaded = [type("D", (), {"page_content": txt, "metadata": {"source": path.name}})()]
                        except Exception:
                            loaded = [type("D", (), {"page_content": path.read_text(encoding="utf-8", errors="ignore"), "metadata": {"source": path.name}})()]
                    else:
                        loaded = [type("D", (), {"page_content": path.read_text(encoding="utf-8", errors="ignore"), "metadata": {"source": path.name}})()]
                except Exception as e:
                    logger.exception("[DOCUMENTS] Failed to load file %s: %s", path, e)
                    continue

                # ensure metadata and append
                for d in loaded:
                    if not hasattr(d, "metadata") or d.metadata is None:
                        d.metadata = {}
                    d.metadata["source"] = path.name
                    docs_for_indexing.append(d)

            if docs_for_indexing:
                # split documents (langchain_service.split_documents expected)
                try:
                    split_docs = langchain_service.split_documents(docs_for_indexing)
                    logger.info("[DOCUMENTS] Split into %d chunks", len(split_docs))
                    # create or update vector store
                    collection_id = collection_name or f"collection_{uuid.uuid4().hex[:8]}"
                    langchain_service.create_vector_store(split_docs, collection_id)
                    logger.info("[DOCUMENTS] Vector store created/updated: %s", collection_id)
                    # Map created doc ids to filenames (we return collection name and filenames)
                    created_doc_ids = [str(uuid.uuid4()) for _ in saved_paths]
                except Exception as e:
                    logger.exception("[DOCUMENTS] Failed to index documents: %s", e)
                    raise HTTPException(status_code=500, detail="Failed to process documents into vector store")
            else:
                logger.warning("[DOCUMENTS] No documents loaded for indexing")
        else:
            # If service not available, still return saved file metadata
            created_doc_ids = [str(uuid.uuid4()) for _ in saved_paths]
            logger.info("[DOCUMENTS] langchain_service unavailable; saved files only")

        # Return normalized response
        response = {
            "collection": collection_name,
            "documentIds": created_doc_ids,
            "filenames": filenames,
            "count": len(saved_paths),
        }
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("[DOCUMENTS] Unexpected error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error while processing uploads")


@router.get("/collections")
async def list_collections():
    """List all document collections"""
    try:
        if not langchain_service:
            raise HTTPException(status_code=503, detail="AI service not available")
        
        vector_store_path = langchain_service.vector_store_path
        collections = []
        
        if vector_store_path.exists():
            for item in vector_store_path.iterdir():
                if item.is_dir():
                    collections.append({
                        "name": item.name,
                        "path": str(item)
                    })
        
        return {
            "collections": collections,
            "count": len(collections)
        }
        
    except Exception as e:
        logger.error(f"❌ List collections error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/collections/{collection_name}")
async def delete_collection(collection_name: str):
    """Delete a document collection"""
    try:
        if not langchain_service:
            raise HTTPException(status_code=503, detail="AI service not available")
        
        collection_path = langchain_service.vector_store_path / collection_name
        
        if collection_path.exists():
            import shutil
            shutil.rmtree(collection_path)
            logger.info(f"🗑️  Deleted collection: {collection_name}")
            return {"success": True, "message": f"Collection '{collection_name}' deleted"}
        else:
            raise HTTPException(status_code=404, detail="Collection not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Delete collection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def documents_health():
    """Document endpoint health check"""
    return {
        "status": "healthy",
        "endpoint": "documents",
        "langchain_available": langchain_service is not None
    }
