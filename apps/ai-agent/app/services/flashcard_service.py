"""
Flashcard Generation Service - Function 2
Creates study flashcards from materials
"""

from typing import List, Dict
from langchain.chat_models import ChatOpenAI
import json

from app.core.vector_store import get_vector_store
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class FlashcardService:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.llm = ChatOpenAI(
            temperature=0.7,
            model=settings.LLM_MODEL
        )

    async def generate_flashcards(
        self,
        user_id: str,
        topic: str,
        num_cards: int,
        difficulty: str
    ) -> List[Dict[str, str]]:
        """
        Generate flashcards for a given topic
        """
        try:
            # Retrieve relevant context from user's documents
            docs = self.vector_store.similarity_search(
                topic,
                k=5,
                filter={"user_id": user_id}
            )
            context = "\n\n".join([doc.page_content for doc in docs])

            # Create prompt
            prompt = f"""Create {num_cards} flashcards for the topic: {topic}
Difficulty: {difficulty}

Context from study materials:
{context[:2000]}

Format each flashcard as:
FRONT: [question or concept]
BACK: [answer or explanation]

Guidelines:
- Make questions clear and concise
- Answers should be informative but brief
- For {difficulty} difficulty: {"simple recall" if difficulty == "easy" else "application and analysis" if difficulty == "medium" else "synthesis and evaluation"}
- Focus on key concepts
- Vary question types (definition, application, comparison)

Generate {num_cards} flashcards now:"""

            response = self.llm.predict(prompt)

            # Parse flashcards
            flashcards = self._parse_flashcards(response, num_cards)

            logger.info(f"Generated {len(flashcards)} flashcards for user {user_id}")

            return flashcards

        except Exception as e:
            logger.error(f"Flashcard generation error: {str(e)}", exc_info=True)
            raise

    def _parse_flashcards(self, response: str, num_cards: int) -> List[Dict[str, str]]:
        """
        Parse flashcards from LLM response
        """
        flashcards = []
        lines = response.split('\n')
        current_card = {}

        for line in lines:
            line = line.strip()
            if line.startswith('FRONT:'):
                if current_card:
                    flashcards.append(current_card)
                current_card = {"front": line.replace('FRONT:', '').strip()}
            elif line.startswith('BACK:'):
                current_card["back"] = line.replace('BACK:', '').strip()

        if current_card and "back" in current_card:
            flashcards.append(current_card)

        # Ensure we have the requested number
        while len(flashcards) < num_cards:
            flashcards.append({
                "front": f"Concept {len(flashcards) + 1} related to topic",
                "back": "Key information about this concept"
            })

        return flashcards[:num_cards]
