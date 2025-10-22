from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_history_aware_retriever
from app.core.vector_store import get_vector_store
from app.core.llm import get_llm
from app.utils.logger import setup_logger
# from app.db.session_store import fetch_messages, save_message  # hypothetical persistence - commented out for now

logger = setup_logger(__name__)

class ChatService:
    def __init__(self):
        self.llm = get_llm()  # Runnable-compatible (supports ainvoke)
        self.vector_store = get_vector_store()

        self.system_prompt = "You are Spark, an intelligent study assistant..."

        # Prompts
        self.condense_prompt = ChatPromptTemplate.from_template(
            """Given the following conversation history and a follow-up question, 
condense the user's last message into a standalone question for retrieval.

Chat history:
{chat_history}

Follow up question:
{question}

Standalone question:"""
        )

        self.answer_prompt = ChatPromptTemplate.from_template(
            f"""{self.system_prompt}

Context from documents:
{{context}}

Chat history:
{{chat_history}}

Question:
{{question}}

Answer thoroughly and suggest 3 follow-up questions (numbered)."""
        )

    async def chat(self, user_id: str, message: str, session_id: str):
        """
        Stateless conversational retrieval chain with external persistence.
        """
        try:
            # --- Step 1: Load history from persistent store ---
            # conversation_history = fetch_messages(session_id, limit=8)  # Not implemented yet
            conversation_history = []
            chat_history_text = "\n".join(
                f"{m['role'].capitalize()}: {m['content']}" for m in conversation_history
            )

            # --- Step 2: Build retriever ---
            base_retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})
            history_aware_retriever = create_history_aware_retriever(
                llm=self.llm,
                retriever=base_retriever,
                prompt=self.condense_prompt
            )

            runnable_input = {
                "query": message,
                "chat_history": chat_history_text,
                "configurable": {"session_id": session_id},
            }

            # --- Step 3: Retrieve context ---
            docs = await history_aware_retriever.ainvoke(runnable_input)

            # --- Step 4: Format context ---
            context_parts = [
                f"Source: {d.metadata.get('source', '')}\n{d.page_content}"
                for d in docs
            ]
            context_text = "\n\n---\n\n".join(context_parts) or "No relevant documents found."

            # --- Step 5: Build prompt and invoke LLM ---
            prompt_inputs = {
                "context": context_text,
                "chat_history": chat_history_text,
                "question": message,
            }

            formatted_prompt = self.answer_prompt.format_prompt(**prompt_inputs)

            if hasattr(self.llm, "ainvoke"):
                output = await self.llm.ainvoke(formatted_prompt.to_messages())
                answer_text = getattr(output, "content", str(output))
            else:
                answer_text = self.llm.predict(formatted_prompt.to_string())

            # --- Step 6: Persist interaction ---
            save_message(user_id, session_id, "user", message)
            save_message(user_id, session_id, "assistant", answer_text)

            # --- Step 7: Build response ---
            return {
                "response": answer_text,
                "follow_up_questions": [],
                "sources": [d.metadata.get("source", "") for d in docs],
            }

        except Exception as e:
            logger.error("Modern ChatService error: %s", e, exc_info=True)
            raise
