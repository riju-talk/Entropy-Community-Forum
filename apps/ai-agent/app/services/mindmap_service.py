"""
Mind Map Generation Service - Function 4
Creates visual concept maps in Mermaid format
"""

from typing import Dict, Any

from app.core.vector_store import get_vector_store
from app.core.llm import get_llm
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class MindMapService:
    def __init__(self):
        self.vector_store = get_vector_store()
        # Use centralized LLM wrapper (ChatGroq) so the backend uses GROQ
        self.llm = get_llm()

    async def generate_mindmap(
        self,
        user_id: str,
        topic: str,
        depth: int,
        style: str
    ) -> Dict[str, Any]:
        """
        Generate a mind map for a topic
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
            prompt = f"""Create a {style} mind map for: {topic}
Depth: {depth} levels

Context:
{context[:2000]}

Generate a Mermaid diagram code that visualizes the concept hierarchy.

For {style} style:
- hierarchical: Use flowchart TD (top-down)
- radial: Use mindmap format
- flowchart: Use flowchart LR (left-right) with decision nodes

Include:
- Main concept at center/top
- {depth} levels of subconcepts
- Clear relationships
- Key terms and definitions

Output ONLY the Mermaid code, starting with graph/flowchart/mindmap."""

            response = self.llm.predict(prompt)

            # Extract Mermaid code
            mermaid_code = self._extract_mermaid_code(response)

            # Create structured data
            mind_map_data = {
                "topic": topic,
                "style": style,
                "depth": depth,
                "node_count": mermaid_code.count('-->') + mermaid_code.count('---')
            }

            logger.info(f"Generated mind map for user {user_id}")

            return {
                "mind_map": mind_map_data,
                "mermaid_code": mermaid_code
            }

        except Exception as e:
            logger.error(f"Mind map generation error: {str(e)}", exc_info=True)
            raise

    def _extract_mermaid_code(self, response: str) -> str:
        """
        Extract Mermaid diagram code from response
        """
        # Remove markdown code blocks
        if "```mermaid" in response:
            code = response.split("```mermaid")[1].split("```")[0].strip()
        elif "```" in response:
            code = response.split("```")[1].split("```")[0].strip()
        else:
            code = response.strip()

        # Ensure it starts with a valid Mermaid directive
        if not any(code.startswith(x) for x in ["graph", "flowchart", "mindmap"]):
            code = f"graph TD\n    {code}"

        return code
