# Entropy - Academic Learning Platform

## Overview

Entropy is a comprehensive academic community platform built with Next.js 14, designed for students to ask questions, share knowledge, and learn collaboratively. The platform features a Q&A system similar to Stack Overflow but focused on academic subjects, with support for anonymous posting, voting systems, markdown content, and real-time collaboration. It serves as a global learning hub where students can get help with doubts, find mentors, and participate in academic events.

## User Preferences

Preferred communication style: Simple, everyday language.

## Documentation

Comprehensive documentation created in `/docs` directory for future development and scaling:

### Current Implementation Docs ✅
- **DATABASE.md**: Complete PostgreSQL schema (accurately reflects `prisma/schema.prisma`)
- **TECH_STACK.md**: All technologies currently used
- **ENV_VARIABLES.md**: Environment variables (current + future marked clearly)

### Future Design Specifications 🔮
- **AI_AGENT.md**: Complete FastAPI + Elasticsearch service design (ready for implementation)
- **PAYMENTS_STRIPE.md**: Stripe integration guide (ready to implement)
- **CREDITS_SUBSCRIPTION.md**: Go/Python microservice design for billing
- **ACHIEVEMENTS_BADGES.md**: Gamification system implementation (schema exists, logic pending)
- **PROJECT_ARCHITECTURE.md**: Overall system architecture (current + planned)
- **SERVICES.md**: External services and integrations guide

### Quick Reference
- **IMPLEMENTATION_STATUS.md**: ⭐ Clear overview of what's implemented vs. planned
- **README.md**: Documentation index and navigation guide

**Usage**: 
- Design docs can be fed to AI (Claude/ChatGPT) to generate complete service implementations
- Serves as blueprint for building fully-scaled production application
- Clearly separates current state from future roadmap

## System Architecture

### Frontend Architecture

**Framework & Routing**
- Next.js 14 with App Router for server-side rendering and file-based routing
- React 18 with TypeScript for type-safe component development
- Server Components by default with Client Components for interactivity

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom theme configuration
- shadcn/ui components following a consistent design system
- Dark/light theme support via next-themes with system preference detection

**State Management & Data Fetching**
- Server Actions for form submissions and mutations
- React hooks for client-side state (useState, useTransition)
- useSession from NextAuth for authentication state
- Optimistic UI updates for voting interactions

**Key Features Implementation**
- Infinite scroll with react-intersection-observer for lazy loading
- Markdown rendering with react-markdown and remark-gfm for rich text
- Real-time session management with NextAuth.js
- Responsive design with mobile-first approach

### Backend Architecture

**Database Layer**
- Prisma ORM as the database client for type-safe queries
- PostgreSQL database hosted on Supabase
- Schema includes: Users, Doubts, Comments, Votes, with relationships
- Support for anonymous posting (nullable author fields)

**Authentication & Authorization**
- NextAuth.js for OAuth and credential-based authentication
- Google OAuth provider configured (GitHub mentioned in README)
- Custom Supabase integration for user management
- Session-based authentication with JWT tokens
- Role-based access control (Student, Teacher, Admin roles)

**API Structure**
- Server Actions in `/app/actions` for doubt and comment operations
- Form validation using Zod schemas in `/lib/validations`
- Server-side validation before database mutations
- Revalidation paths for cache invalidation after mutations

**Core Data Models**
- Doubts: Questions with title, content, subject, tags, votes, resolution status
- Comments: Answers with voting, accepted answer marking
- Votes: Upvote/downvote system for doubts and comments
- Users: Profile information with role and provider details

### External Dependencies

**Authentication Services**
- Google OAuth (via NextAuth.js Google Provider)
- GitHub OAuth (configured but implementation may be incomplete)
- Supabase for user data storage and management

**Database & Storage**
- Supabase: PostgreSQL database hosting with service role access
- Prisma Cloud: Database client and schema management

**Third-Party Libraries**
- Radix UI: Accessible component primitives (@radix-ui/react-*)
- Lucide React: Icon library for UI elements
- React Markdown: Markdown parsing and rendering with GitHub-flavored markdown support
- Nodemailer: Email functionality (configured but usage unclear)

**Development Tools**
- TypeScript: Static type checking
- ESLint & Prettier: Code quality and formatting (build errors ignored in config)
- Next.js Image Optimization: Image handling with external domains whitelisted

**Environment Configuration**
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase admin access key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret
- NextAuth configuration (URL, secret)

**Notable Architectural Decisions**
- Server Actions enabled experimentally for form handling without API routes
- Build errors and TypeScript errors ignored in production builds (technical debt)
- Image optimization disabled (unoptimized: true) for compatibility
- Custom port 5000 configured for development server
- Dual component structure (some components duplicated with different casing)
