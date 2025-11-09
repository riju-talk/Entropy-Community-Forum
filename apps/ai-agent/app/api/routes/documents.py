"""
Document upload and RAG query endpoints using LangChain directly
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import logging
import aiofiles
from pathlib import Path

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader
import docx2txt

from app.services.langchain_service import langchain_service

logger = logging.getLogger(__name__)
router = APIRouter()


class DocxLoader:
    """Custom DOCX loader using docx2txt"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
    
    def load(self) -> List[Document]:
        """Load DOCX file and return as Document"""
        try:
            text = docx2txt.process(self.file_path)
            metadata = {"source": self.file_path}
            return [Document(page_content=text, metadata=metadata)]
        except Exception as e:
            logger.error(f"Error loading DOCX: {e}")
            raise


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    collection_name: str = "default"
):
    """Upload and process document for RAG"""
    try:
        if not langchain_service:
            raise HTTPException(status_code=503, detail="AI service not available")
        
        # Save uploaded file
        upload_dir = Path("./data/uploads")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / file.filename
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        logger.info(f"📁 File uploaded: {file.filename}")
        
        # Process document based on type
        suffix = file_path.suffix.lower()
        
        if suffix == ".pdf":
            loader = PyPDFLoader(str(file_path))
            documents = loader.load()
        elif suffix == ".txt":
            loader = TextLoader(str(file_path), encoding='utf-8')
            documents = loader.load()
        elif suffix in [".doc", ".docx"]:
            loader = DocxLoader(str(file_path))
            documents = loader.load()
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")
        
        logger.info(f"📄 Loaded {len(documents)} documents")
        
        # Split documents
        split_docs = langchain_service.split_documents(documents)
        logger.info(f"✂️  Split into {len(split_docs)} chunks")
        
        # Create vector store
        vectorstore = langchain_service.create_vector_store(split_docs, collection_name)
        
        return {
            "success": True,
            "file_name": file.filename,
            "file_type": suffix,
            "num_documents": len(documents),
            "num_chunks": len(split_docs),
            "collection_name": collection_name,
            "message": f"Document processed! You can now ask questions about '{file.filename}' using the Q&A endpoint."
        }
        
    except Exception as e:
        logger.error(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
