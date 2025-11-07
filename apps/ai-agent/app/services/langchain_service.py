"""
Core LangChain service with RAG capabilities - Using latest LangChain API
"""
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

print("=" * 80)
print("🔵 LOADING LANGCHAIN_SERVICE MODULE")
print("=" * 80)

# Import with latest LangChain API - NO DEPRECATED CHAINS
try:
    print("Importing ChatGroq...")
    from langchain_groq import ChatGroq
    print("Importing core messages...")
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    print("Importing documents...")
    from langchain_core.documents import Document
    print("Importing prompts...")
    from langchain_core.prompts import ChatPromptTemplate
    print("Importing text splitters...")
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    print("Importing embeddings...")
    from langchain_community.embeddings import GPT4AllEmbeddings
    print("Importing Chroma...")
    from langchain_chroma import Chroma
    print("Importing config...")
    from app.core.config import settings
    
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()
    raise

SPARK_PERSONALITY = """You are Spark, an enthusiastic AI learning companion! 🌟
Format responses in clean Markdown with headings, lists, code blocks, and emphasis."""


class LangChainService:
    """Core LangChain service with modern API - NO DEPRECATED CHAINS"""
    
    def __init__(self):
        try:
            print("🔧 Initializing LangChain service...")
            
            # Validate API key
            if not settings.groq_api_key or settings.groq_api_key == "your_groq_api_key_here":
                raise ValueError("Invalid GROQ_API_KEY!")
            
            print(f"🔑 API Key: {settings.groq_api_key[:10]}...{settings.groq_api_key[-4:]}")
            
            # Initialize LLM
            print("Initializing ChatGroq...")
            self.llm = ChatGroq(
                api_key=settings.groq_api_key,
                model=settings.groq_model,
                temperature=0.7,
            )
            print(f"✅ ChatGroq initialized")
            
            # Test LLM
            print("Testing LLM...")
            test_msg = self.llm.invoke([HumanMessage(content="Hello")])
            print(f"✅ LLM tested: {test_msg.content[:30]}...")
            
            # Initialize embeddings
            print("🔄 Initializing GPT4All embeddings...")
            self.embeddings = GPT4AllEmbeddings()
            print("✅ Embeddings initialized")
            
            # Initialize text splitter
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=settings.chunk_size,
                chunk_overlap=settings.chunk_overlap,
            )
            print("✅ Text splitter initialized")
            
            # Vector store path
            self.vector_store_path = Path(settings.vector_store_path)
            self.vector_store_path.mkdir(parents=True, exist_ok=True)
            print("✅ Vector store path created")
            
            print("=" * 80)
            print("✅ LANGCHAIN SERVICE INITIALIZED SUCCESSFULLY")
            print("=" * 80)
            
        except Exception as e:
            print("=" * 80)
            print(f"❌ INITIALIZATION FAILED: {e}")
            print("=" * 80)
            import traceback
            traceback.print_exc()
            raise
    
    async def chat_with_fallback(
        self,
        message: str,
        collection_name: str = "default",
        conversation_history: List[Dict[str, str]] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Bulletproof chat with RAG fallback"""
        try:
            vector_store = self.load_vector_store(collection_name)
            
            if vector_store:
                logger.info("📖 Using RAG")
                return await self.rag_chat(message, vector_store, system_prompt)
            else:
                logger.info("💬 Using direct chat")
                return await self.direct_chat(message, conversation_history, system_prompt)
                
        except Exception as e:
            logger.error(f"Chat error: {e}, falling back")
            return await self.direct_chat(message, conversation_history, system_prompt)
    
    async def rag_chat(
        self,
        message: str,
        vector_store: Chroma,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """RAG chat using vector store retriever directly"""
        try:
            # Create retriever
            retriever = vector_store.as_retriever(search_kwargs={"k": 4})
            
            # Get relevant documents
            docs = retriever.invoke(message)
            
            # Format context from documents
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Create prompt
            prompt_text = system_prompt or SPARK_PERSONALITY
            prompt_text += f"\n\nContext:\n{context}\n\nQuestion: {message}\n\nAnswer:"
            
            # Invoke LLM
            response = self.llm.invoke([HumanMessage(content=prompt_text)])
            
            # Format sources
            sources = [
                {"content": doc.page_content[:200] + "...", "metadata": doc.metadata}
                for doc in docs
            ]
            
            return {
                "answer": response.content.strip(),
                "sources": sources,
                "mode": "rag"
            }
        except Exception as e:
            logger.error(f"RAG error: {e}")
            raise
    
    async def direct_chat(
        self,
        message: str,
        conversation_history: List[Dict[str, str]] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Direct LLM chat"""
        prompt = system_prompt or SPARK_PERSONALITY
        messages = [SystemMessage(content=prompt)]
        
        if conversation_history:
            for msg in conversation_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        messages.append(HumanMessage(content=message))
        response = self.llm.invoke(messages)
        
        return {"answer": response.content.strip(), "sources": [], "mode": "direct"}
    
    def load_vector_store(self, collection_name: str):
        """Load vector store"""
        try:
            persist_dir = str(self.vector_store_path / collection_name)
            if not Path(persist_dir).exists():
                logger.info(f"No vector store found at {persist_dir}")
                return None
            
            store = Chroma(
                collection_name=collection_name,
                embedding_function=self.embeddings,
                persist_directory=persist_dir,
            )
            
            # Check if store has documents
            try:
                count = store._collection.count()
                if count == 0:
                    logger.info(f"Vector store {collection_name} is empty")
                    return None
                logger.info(f"Vector store {collection_name} has {count} documents")
            except:
                pass
            
            return store
        except Exception as e:
            logger.error(f"Load error: {e}")
            return None
    
    def create_vector_store(self, documents, collection_name):
        """Create vector store"""
        persist_dir = str(self.vector_store_path / collection_name)
        store = Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=persist_dir,
        )
        store.add_documents(documents)
        logger.info(f"Created vector store {collection_name} with {len(documents)} documents")
        return store
    
    def split_documents(self, documents):
        """Split documents"""
        return self.text_splitter.split_documents(documents)


# Create singleton
print("=" * 80)
print("🏗️  CREATING LANGCHAIN SERVICE SINGLETON")
print("=" * 80)

langchain_service = None

try:
    langchain_service = LangChainService()
    print("=" * 80)
    print(f"✅ SINGLETON CREATED SUCCESSFULLY")
    print(f"   Object: {langchain_service}")
    print(f"   Type: {type(langchain_service)}")
    print("=" * 80)
except Exception as e:
    print("=" * 80)
    print(f"❌ SINGLETON CREATION FAILED: {e}")
    print("=" * 80)
    import traceback
    traceback.print_exc()
    langchain_service = None

print(f"🔍 Final langchain_service: {langchain_service}")
print(f"🔍 Is None: {langchain_service is None}")
