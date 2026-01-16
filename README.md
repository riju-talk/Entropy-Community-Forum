<h1 align="center">Entropy — Agentic Study Buddy & Academic Community</h1>
<p align="center">
	<img src="https://img.shields.io/badge/Frontend-Vercel-000?logo=vercel" />
	<img src="https://img.shields.io/badge/Backend-Render-3A3?logo=render" />
	<img src="https://img.shields.io/badge/TypeScript-Frontend-3178c6?logo=typescript" />
	<img src="https://img.shields.io/badge/Python-Backend-3776ab?logo=python" />
	<img src="https://img.shields.io/badge/Status-Alpha-yellow" />
</p>
<hr>

<h2>🚀 Project Overview</h2>
<p>
<b>Entropy</b> is a modern academic platform that blends collaborative Q&amp;A, AI-powered study tools, and gamified community engagement into a single unified experience. Built for students and educators, Entropy makes learning more interactive, organized, and motivating by combining human collaboration with intelligent AI assistance.
</p>

<h2>🌟 Key Features</h2>
<ul>
	<li><b>Collaborative Q&amp;A:</b> Ask questions, write answers, and engage in meaningful academic discussions within focused communities.</li>
	<li><b>Document Intelligence:</b> Upload study materials (PDF, DOCX, TXT) and receive context-aware answers grounded in your own content.</li>
	<li><b>AI Study Tools:</b> Automatically generate mind maps, quizzes, and flashcards from uploaded documents to accelerate learning.</li>
	<li><b>Gamification:</b> Earn credits, unlock achievements, and climb leaderboards to stay motivated and consistent.</li>
	<li><b>Community Management:</b> Create or join communities, participate in mentorship programs, and track individual and group achievements.</li>
	<li><b>Security &amp; Scalability:</b> Cloud-native design with API tokens, environment variables, and containerized deployment for secure, scalable operations.</li>
</ul>

<h2>🛠️ Tech Stack & Architecture</h2>
<ul>
	<li><b>Frontend:</b> Next.js (deployed on Vercel) — Handles UI, authentication flows, community interactions, and AI feature integration.</li>
	<li><b>Backend:</b> FastAPI (deployed on Render) — Powers document ingestion, retrieval-augmented generation (RAG), Q&amp;A logic, and study tool generation.</li>
	<li><b>Monorepo:</b> Turborepo for managing multiple applications and shared packages; Docker Compose for local development.</li>
	<li><b>Database:</b> PostgreSQL (managed by Render) — Stores users, posts, documents, achievements, leaderboards, and community metadata.</li>
	<li><b>Authentication:</b> JWT-based authentication with OAuth support (Google, GitHub). Role-based permissions are enforced at the API and database levels.</li>
	<li><b>API Security:</b> Protected endpoints using API tokens and RBAC; sensitive configuration managed through environment variables.</li>
</ul>

<details>
	<summary><b>📁 Directory Structure</b></summary>
	<ul>
		<li><code>apps/app</code> — Next.js frontend application</li>
		<li><code>apps/ai-agent</code> — Python FastAPI backend for AI and document intelligence</li>
		<li><code>packages/</code> — Shared UI components, configs, and utilities</li>
		<li><code>docs/</code> — Project documentation and architecture notes</li>
	</ul>
</details>

<h2>🔗 API Endpoints</h2>
<ul>
	<li><code>POST /api/ai-agent/qa</code> — Collaborative Q&amp;A with optional document grounding</li>
	<li><code>POST /api/ai-agent/documents/upload</code> — Upload and process study materials</li>
	<li><code>POST /api/ai-agent/mindmap</code> — Generate AI-powered mind maps</li>
	<li><code>POST /api/ai-agent/quiz</code> — Auto-generate quizzes from content</li>
	<li><code>POST /api/ai-agent/flashcards</code> — Create flashcards for active recall</li>
</ul>

<h2>💡 Why Use Entropy?</h2>
<ul>
	<li><b>Unified Learning Experience:</b> Q&amp;A, AI study tools, and community features in one platform.</li>
	<li><b>Extensible by Design:</b> Modular architecture allows rapid addition of new tools, agents, and gamification mechanics.</li>
	<li><b>Cloud Native:</b> Built on Vercel and Render for reliability, scalability, and fast iteration.</li>
</ul>

<h2>🌐 Live Demo</h2>
<ul>
	<li><b>Main App:</b> <a href="https://entropy-community-forum.vercel.app" target="_blank">entropy-community-forum.vercel.app</a></li>
	<li><b>AI Agent API:</b> <a href="https://entropy-community-forum.onrender.com" target="_blank">entropy-community-forum.onrender.com</a></li>
</ul>

<hr>
<p align="center"><i>Entropy is modular, scalable, and designed for real academic collaboration — explore, contribute, and learn together.</i></p>
