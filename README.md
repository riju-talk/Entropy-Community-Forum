# Entropy — Agentic Study Buddy & Academic Community (Monorepo)

One-liner
- Entropy combines a Next.js frontend (students/communities/UX) with a Python FastAPI AI Agent (RAG, mindmaps, quizzes, flashcards). It's a Turborepo monorepo designed for local development and cloud deployment (Netlify + Render/Docker).

Why this repo exists
- Provide a collaborative Q&A forum for learners.
- Augment peer answers with an AI agent that can ingest user documents and provide Retrieval-Augmented Generation (RAG) answers.
- Offer study tooling: mermaid mindmaps, quizzes, and flashcards.
- Implement a simple credit system to throttle AI usage and enable gamification.

Contents of this README
1. Repo layout & key files
2. Tech stack & responsibilities
3. Architecture & data flow
4. Full API surface (frontend + AI agent)
5. Key backend internals explained (langchain_service, routes)
6. Frontend integration points and components
7. Environment variables (exact lists)
8. Local development (step-by-step)
9. Build & deploy (Netlify for frontend, Render/Docker for AI agent)
10. Troubleshooting (common errors with fixes)
11. Security and production notes
12. Contributing & license

---

## ALPHA NOTICE — Known Issue: Document upload currently broken

This project is in active alpha. Important known issue:

- SUMMARY: Document upload and processing in the AI Agent (POST /api/documents/upload) currently fails due to a library conflict in the Python AI Agent dependencies. Symptoms include 404/500 responses from the upload endpoint, tracebacks referencing LangChain / loader imports, or failures when creating/parsing documents (PDF / DOCX / Text).

- IMPACT: Uploads will not be processed into the vector store; RAG features that rely on uploaded documents will not work until this is resolved.

- LIKELY CAUSE: Multiple LangChain-related packages (langchain_core, langchain_text_splitters, langchain_community, langchain_chroma, etc.) are at incompatible versions or duplicate packages were installed, causing import/runtime errors in the AI Agent service (apps/ai-agent). The conflict typically appears as ImportError, AttributeError or unexpected API changes when calling loader.split_documents, Chroma initialization, or embedding classes.

- REPRODUCE:
  1. Start the AI agent: from apps/ai-agent venv run `python -m uvicorn app.main:app --reload`
  2. Upload a test file (PDF/TXT/DOCX) via the UI or curl to `POST http://localhost:8000/api/documents/upload`
  3. Inspect server logs for the stack trace; common messages: "ImportError", "module 'langchain' has no attribute ...", "TypeError: ... not callable", or errors from `langchain_service.create_vector_store`.

- COLLECT FOR DEBUGGING (copy/paste to issue):
  - `pip freeze` output from the ai-agent virtualenv
  - The exact traceback from the FastAPI logs when the upload fails
  - The request headers and `Content-Type` used by the frontend (FormData multipart)
  - The `apps/ai-agent/app/services/langchain_service.py` debug logs (enable DEBUG_LANGCHAIN=1 temporarily)

- TEMPORARY WORKAROUNDS:
  1. Run document processing locally in an isolated venv and manually call the document loader code to confirm the loader behavior.
  2. If urgent, bypass RAG: use direct LLM chat (upload not used) — the frontend fallbacks already support direct_chat mode.
  3. Use a stable pinned environment from a working commit (if available) and avoid upgrading LangChain-related packages until a fix is applied.

- RECOMMENDED FIX (prioritized):
  1. Pin compatible package versions in apps/ai-agent/requirements.txt. Recommended steps:
     - In ai-agent venv: pip install pipdeptree && pipdeptree > deps.txt
     - Identify duplicate/conflicting langchain packages.
     - Pin packages to a known-compatible set (example workflow: uninstall all langchain-related packages, then reinstall a single set that matches the project's usage).
  2. Use the project's debug logs to identify failing import (example: if langchain_core vs langchain mismatch, standardize on the "langchain-core" + companion packages that your code imports).
  3. Add or update tests that import the loaders and run a minimal file-load -> split -> embedding -> Chroma add_documents flow.
  4. Once versions are stable, update apps/ai-agent/requirements.txt with exact pinned versions and run `pip install -r requirements.txt` in CI.
  5. Add a runtime check on startup (FastAPI startup event) that attempts to import the critical loader classes and logs a clear error if incompatible — fail fast with an explanatory message.

- EXAMPLE COMMANDS (run in apps/ai-agent venv)
  - Show Python deps:
    ```
    pip freeze
    ```
  - Check dependency tree for conflicts:
    ```
    pip install pipdeptree
    pipdeptree | sed -n '1,200p'
    ```
  - Reinstall carefully:
    ```
    pip uninstall -y langchain langchain-core langchain-community langchain_chroma langchain_text_splitters
    pip install --no-cache-dir langchain_core langchain_text_splitters langchain_community langchain_chroma langchain_groq gpt4all
    ```
    (Adjust package names to match the ones used in your code; prefer exact names used in imports.)
  - Run a simple smoke test:
    ```python
    # run from ai-agent venv
    python - <<'PY'
    from langchain_core.documents import Document
    from langchain_community.embeddings import GPT4AllEmbeddings
    from langchain_chroma import Chroma
    print("Imports OK")
    PY
    ```

- NEXT STEPS / OWNER ACTION REQUIRED:
  - Assign an engineer to:
    1. Capture `pip freeze` and traceback and attach to issue.
    2. Reproduce and pin a working set of langchain-related packages.
    3. Add CI check to prevent incompatible upgrades.
    4. Deploy a patched ai-agent and verify upload through the frontend and Netlify function proxy.

Please treat this as high priority for the alpha stage — document upload is core to RAG functionality. If you want, I will:
- Add a temporary banner in the UI that points to this README note,
- Add a minimal failing test and instructions to pin working package versions,
- Or produce a ready-to-run requirements.txt with pinned versions once you provide `pip freeze` output.

---

1) Repo layout (monorepo / Turborepo)
- Root
  - package.json (turbo scripts)
  - netlify.toml (Netlify config for Turborepo/Next)
  - netlify/functions/* (optional serverless proxy functions)
- apps/app — Next.js 14 frontend (TypeScript, Tailwind)
  - app/  — Next.js App Router pages and layout
  - components/ — UI components (header, ai-agent widgets, doubt-card, etc.)
    - components/ai-agent/* — chat-agent.tsx, qa-agent.tsx, flashcards-agent..., test upload button added to ai-agent page
  - lib/spark-api.ts — client wrapper for AI agent endpoints (used by frontend)
  - package.json — frontend scripts (dev, build, start, prisma)
- apps/ai-agent — Python FastAPI service (AI)
  - app/main.py — FastAPI entry
  - app/api/routes/ — routers (documents.py, qa, mindmap, quiz, flashcards)
  - app/services/langchain_service.py — core LangChain orchestration (embeddings, vector stores, LLM calls)
  - data/ — chroma DB & uploads (persisted locally)
  - setup.py — convenience script to create directories
  - README.md & render.yaml — deployment helper
  - package.json (small) — tell Turborepo this package has no JS outputs (prevents cache warnings)
- docker-compose.yml — local container orchestration for Next.js + ai-agent
- PYTHON_BACKEND_REQUIREMENTS.md — notes for Python backend
- Other: netlify functions, Render config, CI notes may be added

---

2) Tech Stack (concise)
- Frontend: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Radix UI, Lucide icons, Prisma (Postgres)
- Backend (AI Agent): Python 3.11+, FastAPI, LangChain, ChatGroq (LLM), GPT4AllEmbeddings (local embeddings), Chroma (vector DB), PyPDF2/pdfplumber, python-docx/docx2txt
- Orchestration: Turborepo (monorepo), Netlify (frontend hosting + functions), Render/Docker for AI Agent
- Local dev: docker-compose, venv for Python

---

3) Architecture & data flow (high level)
- User interacts with Next.js app (UI) for posting doubts, browsing communities, and calling AI features.
- AI features:
  - Frontend submits requests to Next.js API route or Netlify function at `/api/ai-agent/*`.
  - Netlify function (if used) proxies the request to the public AI Agent URL (AI_AGENT_URL) and returns the response to the browser.
  - AI Agent ingests documents, creates embeddings, stores vectors in Chroma (persisted on disk), and answers questions using RAG or direct LLM when no docs present.
- Credits: stored in Prisma/Postgres; server actions update ledger and user credits.

---

4) API surfaces

A. Frontend (Next.js / server actions / API routes)
- /api/doubts, /api/communities, /api/auth/** — site features (Prisma-backed)
- /api/ai-agent/* — Proxy path to AI agent (Netlify function or direct call in dev)
  - /api/ai-agent/qa — POST question (multipart or JSON) -> answer
  - /api/ai-agent/documents/upload — POST multipart to upload documents
  - /api/ai-agent/documents/collections — list collections
  - /api/ai-agent/documents/collections/:name DELETE — delete collection
  - /api/ai-agent/flashcards, /mindmap, /quiz — generate study artifacts

B. AI Agent (FastAPI) — prefix `/api`
- GET /health — returns status and dependency flags
- POST /api/qa — request fields: question, optional system_prompt, optional multipart `documents[]`
  - Behavior: if collection exists -> RAG; else direct LLM
- POST /api/documents/upload — accepts file (UploadFile), collection_name -> saves to data/uploads, parses file, splits, creates Chroma vector store
- GET /api/documents/collections — list
- DELETE /api/documents/collections/{name} — delete
- POST /api/mindmap — returns mermaid code and themeVars
- POST /api/quiz — generate quiz items
- POST /api/flashcards — generate flashcards

Examples are in apps/ai-agent/README.md and PYTHON_BACKEND_REQUIREMENTS.md.

---

5) Backend internals — LangChainService (core)
File: apps/ai-agent/app/services/langchain_service.py

Key responsibilities:
- Initialization
  - Create ChatGroq LLM wrapper (api_key via GROQ_API_KEY)
  - Initialize embedding provider (GPT4AllEmbeddings)
  - Initialize text splitter (RecursiveCharacterTextSplitter) with settings.chunk_size/overlap
  - Create vector_store_path folder (persist directory)
- chat_with_fallback(message, collection_name, conversation_history, system_prompt)
  - tries to load vector store for collection_name
  - if present, uses rag_chat, else direct_chat
- rag_chat(message, vector_store, system_prompt)
  - create retriever -> get relevant docs -> build context + prompt -> call LLM
- direct_chat(message, conversation_history, system_prompt)
  - build messages list with SystemMessage + history + user -> call LLM
- create_vector_store(documents, collection_name)
  - optionally removes existing collection directory for fresh session
  - create Chroma store and add_documents
- load_vector_store(collection_name)
  - verifies folder exists, attempts to determine document count then returns Chroma store or None
- split_documents(documents) -> text_splitter.split_documents
- generate_research_mindmap / generate_mermaid_mindmap
  - heavy logic to generate Mermaid syntax, sanitize, retry with strict prompt if needed, and return sanitized Mermaid code + themeVars

Notes:
- The service uses defensive logging and supports DEBUG_LANGCHAIN mode.
- It attempts to avoid heavy initialization tests in production (only in debug).
- Vector store persistence path: `settings.vector_store_path` -> typically `apps/ai-agent/data/chroma_db` (configurable).

---

6) Document ingestion route
File: apps/ai-agent/app/api/routes/documents.py

Flow:
- Save uploaded file to `data/uploads`
- Choose loader based on suffix:
  - .pdf -> PyPDFLoader
  - .txt -> TextLoader
  - .doc/.docx -> custom DocxLoader using docx2txt
- Convert to LangChain Document objects -> split -> create vector store with `create_vector_store`
- Return metadata: processed chunks and collection_name
- Collections endpoints list directories under vector_store_path and allow deletion (shallow deletion via shutil.rmtree)

Important: Upload endpoint cleans up temporary files only if explicitly coded; current code saves files and uses them.

---

7) Frontend integration & components
- `apps/app/components/ai-agent/*` contains UI for ChatAgent, QAAgent and FlashcardsAgent.
  - ChatAgent (chat-agent.tsx):
    - Sends JSON POST to `/api/ai-agent/qa` for direct chat.
    - Upload button posts file to `/api/ai-agent/documents/upload` (FormData).
    - Renders responses using ReactMarkdown; shows mode (RAG vs direct).
  - QAAgent (qa-agent.tsx):
    - Supports file uploads + FormData POST to `/api/ai-agent/qa` (multipart).
    - Has a System Prompt textarea to customize model behavior.
  - Header changes:
    - Added ALPHA badge with tooltip text: "Major changes under development — your feedback is crucial"
  - Debug/Test features:
    - Test Document Upload button was added to UI to send a small FormData and log response details (timing, headers, body) — use to trace 404s.

Client helper: `apps/app/lib/spark-api.ts`
- Light wrapper around AI endpoints; used to centralize requests and headers.
- Uses NEXT_PUBLIC_SPARK_API_URL / NEXT_PUBLIC_AI_BACKEND_TOKEN as base and token respectively.

---

8) Environment variables

Frontend (Next.js / Netlify)
- NEXT_PUBLIC_APP_URL — canonical site URL (used in metadata)
- NEXTAUTH_URL — e.g., http://localhost:5000
- NEXTAUTH_SECRET — NextAuth secret
- NEXT_PUBLIC_SPARK_API_URL — direct AI Agent URL (dev)
- NEXT_PUBLIC_AI_BACKEND_TOKEN — shared token (only if safe; prefer server-side proxy)

AI Agent (FastAPI)
- GROQ_API_KEY — key to ChatGroq LLM (required)
- AI_BACKEND_TOKEN or SHARED_SECRET — shared secret used to validate requests from frontend/proxy
- CHROMA_PERSIST_DIR (optional) — where vector store persists
- UPLOAD_DIR (optional) — uploads folder
- LLM_MODEL, LLM_TEMPERATURE, LLM_MAX_TOKENS — LLM config
- EMBEDDING_MODEL — embedding backend (gpt4all)
- DEBUG_LANGCHAIN — enable extra logs (debug only)

Netlify Functions / Proxy
- AI_AGENT_URL — public URL of AI Agent (used by function)
- GROQ_API_KEY / other secrets — must remain on server, not client

Docker-compose (local)
- Uses `.env` for DATABASE_URL, NEXTAUTH_SECRET, GROQ_API_KEY, etc.

---

9) Local development — exact steps

Prereqs: Node 18+, npm 10, Python 3.11+, PostgreSQL, Docker (optional)

1. Clone
   - git clone <repo>
   - cd c:\Code\01_full_stack\entropy-community-forum

2. Install node deps (root)
   - npm install

3. Python ai-agent
   - cd apps/ai-agent
   - python -m venv .venv
   - source .venv/bin/activate (mac/linux) or .venv\Scripts\activate (windows)
   - pip install -r requirements.txt
   - cp .env.example .env and set GROQ_API_KEY & AI_BACKEND_TOKEN
   - python setup.py (creates folders)

4. Database (frontend)
   - Provide DATABASE_URL in .env.local in apps/app
   - cd apps/app
   - npm install
   - npx prisma generate
   - npx prisma db push

5. Run concurrently (Turborepo)
   - From repo root: npm run dev
     - This triggers turbo to run `dev:app` and `dev:agent` in parallel as configured.
   - Frontend: http://localhost:5000
   - AI Agent: http://localhost:8000

If using Docker
- docker-compose up --build
- Ensure ports 5000 (Next.js) and 8000 (AI agent) available.

Testing upload flow
- Use ChatAgent UI: upload PDF -> the frontend POSTs to `/api/ai-agent/documents/upload`.
- If using Netlify in production, proxy must forward multipart data correctly; function must preserve base64 body handling for binary payloads.

---

10) Build & Deploy (concise, exact)

A. Frontend (Netlify, Turborepo)
- Add root `netlify.toml` with `base = "apps/app"`, publish `apps/app/.next`, and plugin `@netlify/plugin-nextjs`.
- Add `netlify/functions/proxy-ai-agent.js` to proxy `/api/ai-agent/*` to `AI_AGENT_URL`.
- Netlify env:
  - AI_AGENT_URL = https://<your-ai-agent-host>
  - Other secrets for build as needed
- Connect repo to Netlify, push -> Netlify builds (it will run npm run build under `apps/app` via netlify.toml).
- Note: If Next.js imports server-only modules at build, move them to server runtime or functions.

B. AI Agent (Render / Docker / self-host)
- Render: use `render.yaml` or Render UI.
- Docker: build image and run with environment variables; ensure public endpoint.
- Ensure `GROQ_API_KEY` set on host, `AI_BACKEND_TOKEN` set to the same secret used by frontend proxy.

C. Netlify Function proxy (important)
- Proxy preserves method, headers, and body.
- Binary responses are base64-encoded by function and are returned with `isBase64Encoded`.
- When uploading, function forwards the raw body to AI Agent.

---

11) Troubleshooting (common problems and fixes)

- "POST /api/ai-agent/documents/upload 404"
  - Verify:
    - AI_AGENT_URL is correct and reachable.
    - AI Agent exposes `/api/documents/upload` (documents router prefix).
    - Netlify redirect -> function mapping: `/api/ai-agent/*` -> `/.netlify/functions/proxy-ai-agent/:splat`.
    - Check Netlify function logs for incoming path and forwarded target URL.
- Turborepo warning: "no output files found for task @entropy/ai-agent#build"
  - Reason: ai-agent is Python service that doesn't produce JS outputs; fix by adding `apps/ai-agent/package.json` with `"turbo": { "outputs": [] }` (already present).
- Multipart / upload issues in proxy:
  - Ensure function forwards base64 raw body and sets `accept-encoding: identity`.
  - On backend, FastAPI `UploadFile` reads file correctly if the request body is forwarded unchanged.
- Chroma/Vector-store empty:
  - Check `apps/ai-agent/data/chroma_db` permissions and contents.
  - Logs in `langchain_service.create_vector_store` / `load_vector_store` show directory paths and entries.
- GPT4All model download:
  - Initial run may download large models (>1–2GB). Allow time for download; ensure sufficient disk and memory.
- GROQ_API_KEY missing -> health returns degraded:
  - Set GROQ_API_KEY on AI Agent host; health checks use it to indicate LLM availability.

---

12) Security & production recommendations
- Never place GROQ_API_KEY or other secrets in client-side envs (NEXT_PUBLIC_*).
- Use server-side Netlify Functions (or your backend) to perform secret-backed operations.
- Protect AI endpoints (uploads, generation) with a shared token or proper authentication.
- Rate-limit AI endpoints per IP/user and track usage to prevent abuse.
- Remove debug logging and DEBUG_LANGCHAIN from production.

---

13) Credits, rate limits & business logic
- Credits reduce usage for free users. Costs are defined in server actions:
  - e.g., mindmap: 5, quiz: 3, flashcard: 3, chat: 1
- Implement per-user quotas for document uploads (example: FREE tier -> 10 documents).
- Points ledger: Prisma `pointsLedger` table records events and amounts.

---

14) Files you will find useful quickly
- apps/app/components/header.tsx — header + ALPHA badge
- apps/app/components/ai-agent/chat-agent.tsx — chat UI + file upload
- apps/app/components/ai-agent/qa-agent.tsx — QA UI (multipart + system prompt)
- apps/app/lib/spark-api.ts — client wrapper
- apps/ai-agent/app/main.py — FastAPI boot
- apps/ai-agent/app/api/routes/documents.py — upload & collections endpoints
- apps/ai-agent/app/services/langchain_service.py — core RAG/LLM logic
- netlify.toml & netlify/functions/proxy-ai-agent.js — frontend hosting + proxy
- docker-compose.yml — local container orchestration
- apps/ai-agent/setup.py — create directories & setup guidance
- apps/ai-agent/render.yaml — Render deployment config

---

15) Contributing
- Fork -> branch -> PR
- Run tests and linting: `npm run lint`, `npm run test`
- Run local dev: `npm run dev` (Turborepo runs both app & ai-agent per config)
- Document new env vars and update README

---

16) License
- MIT

---

If you want, I can:
- Generate a short deploy checklist for Netlify + Render (copy/paste ready),
- Add a `deploy.md` file with exact commands and Netlify/Render UI steps,
- Add a minimal Netlify Function (proxy) to the repo and a `netlify.toml` tuned for Turborepo (if not already present).

