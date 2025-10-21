from __future__ import annotations

from typing import List, Dict, Any

from app.core.vector_store import get_vector_store
from app.core.llm import get_llm


def _format_citations(docs: List[Any]) -> List[Dict[str, Any]]:
    citations = []
    for i, d in enumerate(docs):
        meta = getattr(d, "metadata", {}) or {}
        citations.append(
            {
                "index": i + 1,
                "source": meta.get("source") or meta.get("filename") or "unknown",
                "user_id": meta.get("user_id"),
            }
        )
    return citations


def _build_prompt(question: str, docs: List[Any]) -> str:
    context_lines: List[str] = []
    for i, d in enumerate(docs, 1):
        meta = getattr(d, "metadata", {}) or {}
        source = meta.get("source") or meta.get("filename") or "unknown"
        text = getattr(d, "page_content", "")
        snippet = text[:1000].replace("\n", " ")
        context_lines.append(f"[{i}] {source}\n{snippet}")

    context_block = "\n\n".join(context_lines)

    prompt = (
        "You are a research assistant. Answer the question strictly using the evidence provided. "
        "Cite sources using [index] after each claim. If evidence is insufficient, state that and suggest refinements.\n\n"
        f"Question: {question}\n\n"
        f"Evidence:\n{context_block}\n\n"
        "Instructions:\n"
        "- Be concise.\n"
        "- Use bullet points where appropriate.\n"
        "- Include [index] citations tied to the provided evidence.\n"
    )
    return prompt


def research_and_answer(question: str, k: int = 5) -> Dict[str, Any]:
    """
    Free RAG pipeline using local embeddings (GPT4All) + ChromaDB for retrieval, and ChatGroq for generation.
    """
    vector_store = get_vector_store()
    docs = vector_store.similarity_search(question, k=k)

    prompt = _build_prompt(question, docs)
    llm = get_llm()
    result = llm.invoke(prompt)
    answer_text = getattr(result, "content", None) or str(result)

    return {
        "answer": answer_text,
        "citations": _format_citations(docs),
    }
