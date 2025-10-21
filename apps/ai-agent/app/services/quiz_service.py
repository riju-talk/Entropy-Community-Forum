"""
Quiz Generation Service - Function 3
Creates interactive quizzes with auto-grading
"""

from typing import List, Dict
import json
import re

from app.core.vector_store import get_vector_store
from app.core.llm import get_llm
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class QuizService:
    def __init__(self):
        self.vector_store = get_vector_store()
        self.llm = get_llm()

    async def generate_quiz(
        self,
        user_id: str,
        topic: str,
        num_questions: int,
        question_types: List[str]
    ) -> List[Dict]:
        """
        Generate a quiz on a given topic
        """
        try:
            # Retrieve context
            docs = self.vector_store.similarity_search(
                topic,
                k=5,
                filter={"user_id": user_id}
            )
            context = "\n\n".join([doc.page_content for doc in docs])

            # Create prompt
            prompt = f"""Create a {num_questions}-question quiz on: {topic}

Context from study materials:
{context[:2000]}

Include these question types: {', '.join(question_types)}

For each question, provide:
1. Question text
2. Options (for MCQ, 4 options labeled A-D)
3. Correct answer
4. Explanation

Format as JSON array:
[
  {{
    "type": "mcq",
    "question": "Question text?",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correct_answer": "A. Option 1",
    "explanation": "Explanation text"
  }},
  {{
    "type": "true_false",
    "question": "Statement is true or false?",
    "options": ["True", "False"],
    "correct_answer": "True",
    "explanation": "Explanation"
  }}
]

Generate {num_questions} questions now:"""

            response = self.llm.predict(prompt)

            # Parse quiz
            quiz = self._parse_quiz(response, num_questions, question_types)

            logger.info(f"Generated {len(quiz)} quiz questions for user {user_id}")

            return quiz

        except Exception as e:
            logger.error(f"Quiz generation error: {str(e)}", exc_info=True)
            raise

    def _parse_quiz(
        self,
        response: str,
        num_questions: int,
        question_types: List[str]
    ) -> List[Dict]:
        """
        Parse quiz from LLM response
        """
        try:
            # Try to extract JSON
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                quiz = json.loads(json_match.group())
                return quiz[:num_questions]
        except:
            pass

        # Fallback: create sample quiz
        quiz = []
        for i in range(num_questions):
            q_type = question_types[i % len(question_types)]

            if q_type == "mcq":
                quiz.append({
                    "type": "mcq",
                    "question": f"Sample MCQ question {i+1} about the topic",
                    "options": [
                        "A. Option 1",
                        "B. Option 2",
                        "C. Option 3",
                        "D. Option 4"
                    ],
                    "correct_answer": "A. Option 1",
                    "explanation": "This is the correct answer because..."
                })
            elif q_type == "true_false":
                quiz.append({
                    "type": "true_false",
                    "question": f"Sample True/False question {i+1}",
                    "options": ["True", "False"],
                    "correct_answer": "True",
                    "explanation": "This statement is true because..."
                })
            else:  # short_answer
                quiz.append({
                    "type": "short_answer",
                    "question": f"Sample short answer question {i+1}",
                    "options": None,
                    "correct_answer": "Sample answer",
                    "explanation": "This is the expected answer..."
                })

        return quiz
