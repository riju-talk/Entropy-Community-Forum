"""
Groq AI service using LangChain framework
"""
import json
from typing import List, Dict, Any, Optional
import logging
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from app.services.langchain_service import langchain_service

logger = logging.getLogger(__name__)

# Spark's personality
SPARK_PERSONALITY = """You are Spark, an enthusiastic and friendly AI learning companion! 🌟

Your personality:
- Warm, encouraging, and patient
- Use emojis occasionally to make learning fun
- Break down complex topics into digestible pieces
- Ask guiding questions to help students think critically
- Celebrate small wins and progress
- Provide hints before direct answers
- Share interesting facts and real-world applications

Remember: You're inspiring curiosity and making learning enjoyable!"""


class GroqService:
    """Service for educational content generation using LangChain"""
    
    def __init__(self):
        if not langchain_service:
            raise RuntimeError("LangChain service not initialized")
        self.langchain = langchain_service
        logger.info("✅ Groq service initialized with LangChain")
    
    async def generate_quiz(
        self,
        topic: str,
        num_questions: int = 5,
        difficulty: str = "medium",
        custom_prompt: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate quiz questions"""
        try:
            system_prompt = custom_prompt or f"""Generate {num_questions} multiple-choice questions about {topic} at {difficulty} difficulty.

Return ONLY valid JSON array:
[{{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}}]"""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Create {num_questions} {difficulty} questions about: {topic}")
            ]
            
            content = await self.langchain.invoke_llm(messages, temperature=0.7, max_tokens=2000)
            
            # Clean and parse JSON
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            questions = json.loads(content)
            logger.info(f"✅ Generated {len(questions)} quiz questions")
            return questions
            
        except Exception as e:
            logger.error(f"Quiz generation error: {e}")
            return [{"question": f"Error: {str(e)}", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "Error"}]
    
    async def generate_mindmap(
        self,
        topic: str,
        diagram_type: str = "mindmap",
        custom_prompt: Optional[str] = None
    ) -> str:
        """Generate Mermaid diagram"""
        try:
            system_prompt = custom_prompt or f"""Create a {diagram_type} diagram for {topic}.
Return ONLY valid Mermaid syntax without markdown formatting."""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Create {diagram_type} for: {topic}")
            ]
            
            content = await self.langchain.invoke_llm(messages, temperature=0.7, max_tokens=1500)
            
            # Clean Mermaid code
            if "```mermaid" in content:
                content = content.split("```mermaid")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            logger.info(f"✅ Generated {diagram_type}")
            return content
            
        except Exception as e:
            logger.error(f"Mindmap error: {e}")
            return f"Error: {str(e)}"
    
    async def generate_flashcards(
        self,
        topic: str,
        count: int = 10,
        custom_prompt: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Generate flashcards"""
        try:
            system_prompt = custom_prompt or f"""Generate {count} flashcards about {topic}.
Return ONLY valid JSON array: [{{"front": "...", "back": "..."}}]"""

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Create {count} flashcards for: {topic}")
            ]
            
            content = await self.langchain.invoke_llm(messages, temperature=0.7, max_tokens=2000)
            
            # Clean and parse
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            flashcards = json.loads(content)
            logger.info(f"✅ Generated {len(flashcards)} flashcards")
            return flashcards
            
        except Exception as e:
            logger.error(f"Flashcard error: {e}")
            return [{"front": "Error", "back": str(e)}]
    
    async def answer_question(
        self,
        question: str,
        context: Optional[str] = None,
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Answer question"""
        try:
            system_prompt = custom_prompt or "You are a helpful AI tutor. Answer clearly and educationally."
            user_message = f"Context: {context}\n\nQuestion: {question}" if context else question
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]
            
            answer = await self.langchain.invoke_llm(messages, temperature=0.7, max_tokens=1000)
            
            return {"answer": answer, "confidence": 0.95}
            
        except Exception as e:
            logger.error(f"Q&A error: {e}")
            return {"answer": f"Error: {str(e)}", "confidence": 0.0}
    
    async def chat(
        self,
        message: str,
        conversation_history: List[Dict[str, str]] = None,
        custom_prompt: Optional[str] = None
    ) -> str:
        """Chat with Spark"""
        try:
            system_prompt = custom_prompt or SPARK_PERSONALITY
            messages = [SystemMessage(content=system_prompt)]
            
            # Add history
            if conversation_history:
                for msg in conversation_history:
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=msg["content"]))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=msg["content"]))
            
            messages.append(HumanMessage(content=message))
            
            reply = await self.langchain.invoke_llm(messages, temperature=0.8, max_tokens=1000)
            logger.info("✅ Chat response generated")
            return reply
            
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return f"Error: {str(e)}"
    
    async def get_greeting(self) -> str:
        """Get greeting"""
        return "Hi! I'm Spark ⚡ - your AI study buddy! What would you like to explore today?"


# Create singleton
logger.info("Creating Groq service...")
try:
    groq_service = GroqService()
    logger.info("✅ Groq service created")
except Exception as e:
    logger.error(f"❌ Failed to create Groq service: {e}")
    groq_service = None