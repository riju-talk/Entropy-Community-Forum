"""
Conversational AI Service - Function 1
Provides context-aware chat with RAG
"""

from typing import List, Dict, Optional
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

from app.core.vector_store import get_vector_store
from app.core.llm import get_llm
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class ChatService:
    def __init__(self):
        self.llm = get_llm()
        self.vector_store = get_vector_store()
        self.system_prompt = """You are Spark, an intelligent study assistant for the Entropy platform.

Your capabilities:
1. Answer questions based on uploaded study materials and general knowledge
2. Provide clear, step-by-step explanations
3. Use analogies and real-world examples
4. Encourage critical thinking
5. Generate relevant follow-up questions

Guidelines:
- Be encouraging and supportive
- Break down complex concepts
- When unsure, acknowledge limitations
- Always generate 3 thoughtful follow-up questions
- Cite uploaded materials when relevant

Remember: Your goal is to help students learn, not just provide answers."""

    async def chat(
        self,
        user_id: str,
        message: str,
        session_id: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> Dict:
        """
        Generate AI response with context from uploaded materials
        """
        try:
            # Create prompt template
            prompt_template = f"""{self.system_prompt}

Previous conversation:
{{chat_history}}

Relevant information from study materials:
{{context}}

Current question: {{question}}

Provide a comprehensive answer and generate 3 follow-up questions."""

            PROMPT = PromptTemplate(
                template=prompt_template,
                input_variables=["chat_history", "context", "question"]
            )

            # Set up memory
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer"
            )

            # Add conversation history to memory
            if conversation_history:
                for msg in conversation_history[-5:]:  # Last 5 messages
                    if msg["role"] == "user":
                        memory.chat_memory.add_user_message(msg["content"])
                    else:
                        memory.chat_memory.add_ai_message(msg["content"])

            # Create retrieval chain
            qa_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.vector_store.as_retriever(
                    search_kwargs={
                        "k": 3,
                        "filter": {"user_id": user_id}
                    }
                ),
                memory=memory,
                combine_docs_chain_kwargs={"prompt": PROMPT},
                return_source_documents=True
            )

            # Get response
            result = qa_chain({"question": message})
            response_text = result["answer"]

            # Generate follow-up questions
            follow_ups = await self._generate_follow_ups(response_text, message)

            logger.info(f"Chat response generated for user {user_id}")

            return {
                "response": response_text,
                "follow_up_questions": follow_ups,
                "sources": [doc.metadata.get("source", "") for doc in result.get("source_documents", [])]
            }

        except Exception as e:
            logger.error(f"Chat service error: {str(e)}", exc_info=True)
            raise

    async def _generate_follow_ups(self, response: str, question: str) -> List[str]:
        """
        Generate 3 relevant follow-up questions
        """
        try:
            prompt = f"""Based on this Q&A:

Question: {question}
Answer: {response[:500]}...

Generate 3 insightful follow-up questions that would help deepen understanding.
Return only the questions, numbered 1-3, one per line."""

            llm = ChatOpenAI(
                temperature=0.7,
                model=settings.LLM_MODEL
            )

            follow_up_response = llm.predict(prompt)

            # Parse questions
            questions = []
            for line in follow_up_response.split('\n'):
                line = line.strip()
                if line and (line[0].isdigit() or line.startswith('-')):
                    question_text = line.lstrip('0123456789.-) ').strip()
                    if question_text:
                        questions.append(question_text)

            return questions[:3]

        except Exception as e:
            logger.error(f"Follow-up generation error: {str(e)}")
            return [
                "Can you explain this concept in a different way?",
                "What are some real-world applications?",
                "How does this relate to other topics?"
            ]
