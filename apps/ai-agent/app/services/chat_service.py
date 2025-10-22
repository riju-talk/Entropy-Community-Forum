"""
Modern ChatService: uses conversational retrieval chain with history handling
"""

from typing import List, Dict
from langchain_community.retrievers import create_history_aware_retriever
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

from app.core.vector_store import get_vector_store
from app.core.llm import get_llm
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class ChatService:
    def __init__(self):
        self.llm = get_llm()            # should be a Runnable-compatible LLM (supports .ainvoke / .apredict when available)
        self.vector_store = get_vector_store()

        self.system_prompt = "You are Spark, an intelligent study assistant..."

        # The prompt used to convert chat history + question -> retrieval query.
        self.condense_prompt = ChatPromptTemplate(
            template="""Given the following conversation history and a follow-up question, 
condense the user's last message into a standalone question for retrieval.

Chat history:
{chat_history}

Follow up question:
{question}

Standalone question:""",
            input_variables=["chat_history", "question"]
        )

        # The prompt used to answer given context + question
        self.answer_prompt = ChatPromptTemplate(
            template=f"""{self.system_prompt}

Context from documents:
{{context}}

Chat history:
{{chat_history}}

Question:
{{question}}

Answer with step-by-step explanation and provide 3 follow-up questions (numbered).""",
            input_variables=["context", "chat_history", "question"]
        )

    async def chat(self, user_id: str, message: str, session_id: str, conversation_history: List[Dict[str,str]] = None):
        """
        1) Use create_history_aware_retriever to get documents relevant to the current question (taking chat history into account)
        2) Call the LLM with the answer prompt including retrieved context
        """
        try:
            # Build a simple chat_history text (langchain also accepts list[BaseMessage])
            if conversation_history:
                # convert to a short textual summary (or use BaseMessage objects)
                # keep last N messages to stay bounded
                parts = []
                for m in conversation_history[-8:]:
                    role = "User" if m["role"] == "user" else "Assistant"
                    parts.append(f"{role}: {m['content']}")
                chat_history_text = "\n".join(parts)
            else:
                chat_history_text = ""

            # Create base retriever (with filters if supported)
            base_retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})

            # Create a history-aware retriever that uses the LLM to condense the question
            history_aware_retriever = create_history_aware_retriever(
                llm=self.llm,
                retriever=base_retriever,
                prompt=self.condense_prompt
            )

            # The history_aware_retriever is a runnable - call it with the appropriate inputs.
            # It expects keys like {"query": message, "chat_history": <list or text>}
            # Use async invoke if available:
            runnable_input = {"query": message, "chat_history": chat_history_text, "configurable": {"session_id": session_id}}

            # This returns a List[Document]
            docs = await history_aware_retriever.ainvoke(runnable_input)

            # Build the retrieved context text (concatenate top docs, include metadata citations)
            context_parts = []
            for d in docs:
                src = d.metadata.get("source") or d.metadata.get("id") or ""
                context_parts.append(f"Source: {src}\n{d.page_content}")
            context_text = "\n\n---\n\n".join(context_parts) or "No relevant documents found."

            # Create final answer prompt and call the llm
            prompt_inputs = {
                "context": context_text,
                "chat_history": chat_history_text,
                "question": message
            }
            # Many LLM wrappers support .apredict or .ainvoke
            if hasattr(self.llm, "ainvoke"):
                output = await self.llm.ainvoke(self.answer_prompt.format_prompt(**prompt_inputs).to_messages())
                answer_text = output.content if hasattr(output, "content") else str(output)
            else:
                # fallback: sync call
                answer_text = self.llm.predict(self.answer_prompt.format_prompt(**prompt_inputs).to_string())

            # parse follow-ups from the answer_text or generate separately
            # (you can reuse your _generate_follow_ups logic here)
            follow_ups = []  # implement as desired

            return {
                "response": answer_text,
                "follow_up_questions": follow_ups,
                "sources": [d.metadata.get("source", "") for d in docs]
            }

        except Exception as e:
            logger.error("Modern chat error: %s", e, exc_info=True)
            raise
