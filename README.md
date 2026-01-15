

# Entropy — Agentic Study Buddy & Academic Community

![Vercel](https://img.shields.io/badge/Frontend-Vercel-000?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-3A3?logo=render)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178c6?logo=typescript)
![Python](https://img.shields.io/badge/Python-Backend-3776ab?logo=python)
![Status](https://img.shields.io/badge/Status-Alpha-yellow)

---

## Problem Statement

Modern learners face fragmented study experiences: Q&A forums lack intelligent context, AI tools are siloed, and community engagement is often shallow. Students struggle to find reliable answers, organize study materials, and stay motivated in their learning journey.

---

## Solution: Entropy Community Forum

Entropy unifies collaborative Q&A, AI-powered study tools, and gamified community features into a single seamless platform. It empowers students and educators to:

- **Ask and answer questions** in a vibrant, supportive community
- **Upload study materials** (PDF, DOCX, TXT) and get context-aware answers
- **Visualize knowledge** with AI-generated mind maps
- **Practice and revise** using quizzes and flashcards created from real content
- **Earn credits and climb leaderboards** for active participation
- **Join or create communities** for focused learning and mentorship

---

## Product Overview

**Entropy** is a next-generation academic platform designed for engagement, productivity, and deep learning. It combines:

- **Modern UI:** Fast, responsive, and accessible interface built with Next.js and Tailwind CSS
- **AI Agent:** Python FastAPI backend (deployed on Render) for document intelligence, RAG, and study tool APIs
- **Gamification:** Credits, achievements, and leaderboards to motivate and reward users
- **Community-first:** Tools for group learning, mentorship, and knowledge sharing

---

## Architecture

- **Frontend:** Next.js (Vercel) — user interface, authentication, community features, and AI integration
- **Backend:** FastAPI (Render) — document processing, Retrieval-Augmented Generation (RAG), and study tool APIs
- **Orchestration:** Turborepo for monorepo management, Docker Compose for local development

### Directory Structure
- `apps/app` — Next.js frontend
- `apps/ai-agent` — Python FastAPI AI backend
- `packages/` — Shared configs and UI components
- `docs/` — All documentation

---

## Key Features

- **Collaborative Q&A:** Post questions, answer peers, and engage in community-driven discussions
- **AI-Powered Study Tools:** Document-aware Q&A, mind maps, quizzes, and flashcards
- **Gamified Learning:** Earn credits, unlock achievements, and compete on leaderboards
- **Community Management:** Create/join communities, mentorship, and track achievements
- **Secure & Scalable:** API tokens, environment variables, and containerized deployment

---

## API Highlights

- `POST /api/ai-agent/qa` — Q&A with or without uploaded documents
- `POST /api/ai-agent/documents/upload` — Upload and process study materials
- `POST /api/ai-agent/mindmap`, `/quiz`, `/flashcards` — Generate study tools

---

## Live Demo

- **Main App:** https://entropy-community-forum.vercel.app
- **AI Agent API:** https://entropy-community-forum.onrender.com

---

## For Product Stakeholders

- **Unified Experience:** All-in-one platform for collaborative learning and AI-powered productivity
- **Rapid Extensibility:** Modular design for adding new study tools, community features, or gamification mechanics
- **Cloud Native:** Deployed on Vercel (frontend) and Render (backend) for reliability and scale

---