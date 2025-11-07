"""
Q&A Router with Document Intelligence - SIMPLIFIED
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
import uuid
from services.llm import llm_service
from services.vector_store import vector_store_service
from services.document_processor import document_processor

router = APIRouter()

@router.post("/qa")
async def qa_endpoint(
    question: str = Form(...),
    system_prompt: str = Form("You are a helpful AI tutor. Provide clear, concise, and educational responses."),
    documents: Optional[List[UploadFile]] = File(None)
):
    """
    Q&A endpoint with document intelligence (RAG)
    PUBLIC - No auth required for basic Q&A
    """
    try:
        if not question or not question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        context = ""
        sources = []
        
        # Process documents if provided
        if documents and len(documents) > 0:
            try:
                doc_texts = await document_processor.process_documents(documents)
                
                if doc_texts:
                    collection_name = f"qa_session_{uuid.uuid4().hex[:8]}"
                    all_chunks = []
                    
                    for idx, doc_text in enumerate(doc_texts):
                        chunks = document_processor.chunk_text(doc_text)
                        all_chunks.extend(chunks)
                        sources.append(documents[idx].filename)
                    
                    if all_chunks:
                        await vector_store_service.add_documents(
                            collection_name=collection_name,
                            texts=all_chunks
                        )
                        
                        relevant_docs = await vector_store_service.query_documents(
                            collection_name=collection_name,
                            query_text=question,
                            n_results=min(3, len(all_chunks))
                        )
                        
                        if relevant_docs:
                            context = "\n\n".join([doc["content"] for doc in relevant_docs])
                        
                        vector_store_service.delete_collection(collection_name)
            except Exception as doc_error:
                print(f"Document processing error: {doc_error}")
        
        # Generate answer
        if context:
            answer = await llm_service.generate_with_context(
                question=question,
                context=context,
                system_prompt=system_prompt
            )
        else:
            answer = await llm_service.generate_response(
                prompt=question,
                system_prompt=system_prompt
            )
        
        return {
            "answer": answer,
            "has_context": bool(context),
            "sources": sources if sources else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"QA error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process question: {str(e)}")
