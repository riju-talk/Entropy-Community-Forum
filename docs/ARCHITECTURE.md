# Entropy Community Forum — Architecture

## Monorepo Structure
Entropy uses a Turborepo monorepo for scalable, modular development and deployment.

### Main Directories
- `apps/app` — Next.js frontend (user interface, communities, Q&A, AI integration)
- `apps/ai-agent` — Python FastAPI backend (AI agent, document processing, RAG)
- `packages/` — Shared configs and UI components
- `docs/` — All documentation

## Data Flow
1. **User interacts with frontend** (Q&A, document upload, AI tools)
2. **Frontend sends API requests** to the AI agent backend
3. **AI agent processes requests** (document embedding, semantic search, LLM generation)
4. **Results returned to frontend** for display (answers, mind maps, quizzes, flashcards)

## Key Technologies
- **Frontend:** Next.js, React, Tailwind CSS, Prisma, TypeScript
- **Backend:** FastAPI, LangChain, ChromaDB, Groq (Llama 3), GPT4All, Docker
- **Orchestration:** Docker Compose for local development, Render/Docker for production

## Security & Scalability
- API tokens and environment variables for secure communication
- Containerized backend for scalable deployment
- Health checks and isolated user data

## Extensibility
- Add new AI features by extending backend services/routes
- Add new community or gamification features via modular frontend components

---

For more details, see the main README in this directory.