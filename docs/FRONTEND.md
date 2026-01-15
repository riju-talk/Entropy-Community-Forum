# Entropy Next.js Frontend

## Overview
The Entropy frontend is a modern, responsive web application built with Next.js and React. It serves as the main user interface for the Entropy Community Forum, enabling collaborative learning, Q&A, and seamless integration with the AI Agent backend.

## Key Features
- **Q&A Forum:** Post questions, answer peers, and upvote/downvote answers.
- **AI Study Tools:** Access document-aware Q&A, mind mapping, quizzes, and flashcards via the AI Agent.
- **Community Management:** Create and join communities, participate in mentorship, and track achievements.
- **Gamification:** Earn credits for participation and climb the leaderboard.
- **Authentication:** OAuth integration (GitHub, Google) for secure sign-in.
- **User Profiles:** View and edit profiles, achievements, and activity history.

## Technology Stack
- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **Prisma ORM**
- **TypeScript**

## Integration Points
- Communicates with the AI Agent backend via REST APIs.
- Handles document uploads and displays AI-generated content (answers, mind maps, quizzes, flashcards).
- Uses a credit system to manage access to premium AI features.

## Extensibility
- Modular component structure for rapid feature development.
- Easily add new community features, study tools, or gamification mechanics.

## Security
- Sensitive operations protected by environment variables and API tokens.
- User data is securely managed and isolated.

---

For more details, see the main README in this directory.