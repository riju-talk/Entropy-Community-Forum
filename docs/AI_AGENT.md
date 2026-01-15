# Entropy AI Agent Backend

## Overview
The Entropy AI Agent is a FastAPI-based backend service that powers all AI-driven features in the Entropy Community Forum. It provides document-aware Q&A, mind mapping, quiz, and flashcard generation using state-of-the-art open-source and free AI models.

## Key Features
- **Document Intelligence:** Upload PDFs, DOCX, or TXT files for context-aware answers.
- **Mind Mapping:** Generate mermaid.js diagrams for visual learning.
- **Quiz Generator:** Create multiple-choice quizzes with explanations.
- **Flashcards:** Generate study flashcards from any content.
- **Retrieval-Augmented Generation (RAG):** Uses ChromaDB and embeddings for semantic search.

## Technology Stack
- **FastAPI** for API endpoints
- **LangChain** for document processing and RAG
- **ChromaDB** for vector storage
- **Groq (Llama 3)** and **GPT4All** for LLM and embeddings
- **Docker** for containerization

## API Endpoints
- `/api/qa` — Q&A with document context
- `/api/documents/upload` — Upload and process documents
- `/api/mindmap` — Generate mind maps
- `/api/quiz` — Generate quizzes
- `/api/flashcards` — Generate flashcards

## Extensibility
- Add new endpoints or AI models by extending the `services/` and `routes/` modules.
- Modular design for easy integration of new document loaders or vector stores.

## Security
- All endpoints are protected by API tokens and environment variables.
- User uploads and data are isolated per session/community.

## Deployment
- Designed for containerized deployment (Docker, Render, Railway, etc.)
- Health checks and environment-based configuration for production readiness.

---

For more details, see the main README in this directory.