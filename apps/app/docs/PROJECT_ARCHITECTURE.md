# Project Architecture Documentation

> **Status**: ✅ Current + 🔮 Future Architecture

> ℹ️ **Mixed Document**: Describes current implementation (Next.js app, database) and future planned microservices.

Comprehensive architectural overview of the Entropy Academic Platform.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Main Application](#main-application)
4. [Microservices](#microservices)
5. [Data Flow](#data-flow)
6. [Security Architecture](#security-architecture)
7. [Scalability Design](#scalability-design)
8. [Deployment Architecture](#deployment-architecture)
9. [Future Roadmap](#future-roadmap)

---

## System Overview

### High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Web UI     │  │  Mobile PWA  │  │   Desktop    │  │
│  │  (Next.js)   │  │  (Planned)   │  │   (Planned)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel Edge Network (CDN)                   │
│                  SSL/TLS Termination                     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Next.js 14 Application (Main App)             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Pages     │  │  API Routes  │  │   Server     │  │
│  │  (App Dir)   │  │              │  │   Actions    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          NextAuth.js (Authentication)            │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PostgreSQL  │     │  AI Agent    │     │   Credits &  │
│   Database   │     │   Service    │     │ Subscription │
│  (Supabase)  │     │  (FastAPI)   │     │   (Go/Py)    │
└──────────────┘     └──────────────┘     └──────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │Elasticsearch │  │   OpenAI     │
            │  (Vectors)   │  │     API      │
            └──────────────┘  └──────────────┘

        ┌──────────────────────────────────────┐
        │     External Services (Planned)      │
        │                                      │
        │  • Stripe (Payments)                │
        │  • Resend (Email)                   │
        │  • Redis (Cache)                    │
        │  • Sentry (Monitoring)              │
        └──────────────────────────────────────┘
\`\`\`

### Core Components

1. **Frontend**: Next.js 14 with React Server Components
2. **Backend**: Next.js API Routes + Server Actions
3. **Database**: PostgreSQL (Prisma ORM)
4. **Authentication**: NextAuth.js
5. **Microservices**: AI Agent, Credits Management
6. **External**: Stripe, OpenAI, Elasticsearch

---

## Architecture Patterns

### 1. Monolith + Microservices Hybrid

**Main Application (Monolith)**:
- Next.js full-stack application
- Handles core features (doubts, comments, voting)
- User authentication
- UI rendering

**Microservices**:
- **AI Agent Service**: Independent AI/ML processing
- **Credits Service**: High-volume transaction handling

**Why Hybrid?**
- Simple features stay in monolith (faster development)
- Complex/resource-intensive features become microservices (better scaling)
- Easy to extract more microservices as needed

### 2. Server-First Architecture

**Server Components** (Default):
- Fetch data on server
- Reduce client JavaScript
- Better SEO
- Faster initial load

**Client Components** (When needed):
- Interactive UI
- Browser-only features
- State management

### 3. API-First Design

All data operations exposed as:
1. **Server Actions**: Direct server-side mutations
2. **API Routes**: REST endpoints for microservices
3. **tRPC** (Future): Type-safe API layer

---

## Main Application

### Directory Structure

\`\`\`
app/
├── (auth)/               # Authentication pages
│   ├── signin/
│   └── signup/
│
├── (main)/              # Main application
│   ├── page.tsx         # Home page
│   ├── ask/             # Ask question
│   ├── doubts/          # Question pages
│   │   └── [id]/
│   ├── profile/         # User profiles
│   ├── leaderboard/     # Gamification
│   ├── achievements/    # Achievements page
│   └── subscription/    # Pricing/subscription
│
├── api/                 # API Routes
│   ├── doubts/
│   ├── comments/
│   ├── ai-agent/
│   ├── stripe/
│   └── auth/
│
├── actions/             # Server Actions
│   ├── doubts.ts
│   ├── comments.ts
│   ├── votes.ts
│   ├── points.ts
│   ├── achievements.ts
│   └── leaderboard.ts
│
└── layout.tsx           # Root layout

components/
├── ui/                  # Reusable UI components
├── header.tsx
├── sidebar.tsx
├── doubt-card.tsx
├── comment-thread.tsx
└── user-avatar.tsx

lib/
├── auth.ts              # NextAuth config
├── prisma.ts            # Prisma client
├── utils.ts             # Utilities
├── validations.ts       # Zod schemas
└── stripe.ts            # Stripe config

prisma/
└── schema.prisma        # Database schema
\`\`\`

### Request Flow

\`\`\`
User Request
    ↓
Next.js Middleware (Auth check)
    ↓
Page Component (Server Component)
    ↓
Server Action / API Route
    ↓
Validation (Zod)
    ↓
Business Logic
    ↓
Database (Prisma)
    ↓
Response
\`\`\`

---

## Microservices

### AI Agent Service

**Purpose**: Intelligent features (chat, search, recommendations)

**Tech Stack**:
- FastAPI (Python)
- Elasticsearch (vector storage)
- Sentence-BERT (embeddings)
- OpenAI API (LLM)

**Endpoints**:
\`\`\`
POST /api/chat              - AI chat
POST /api/search            - Semantic search
POST /api/recommend         - Recommendations
POST /api/index             - Index content
POST /api/similar           - Find duplicates
POST /api/evaluate-answer   - Quality scoring
\`\`\`

**Communication**:
\`\`\`
Next.js App
    ↓ HTTP REST
AI Agent Service
    ↓ Vector Search
Elasticsearch
    ↓ LLM Calls
OpenAI API
\`\`\`

**Deployment**: Railway/Render (containerized)

---

### Credits & Subscription Service

**Purpose**: Manage credits, subscriptions, quotas

**Tech Stack**:
- Go (Golang) OR Python FastAPI
- PostgreSQL
- Stripe webhooks

**Endpoints**:
\`\`\`
GET  /api/credits/{userId}/balance
POST /api/credits/{userId}/add
POST /api/credits/{userId}/deduct
GET  /api/credits/{userId}/history

GET  /api/subscriptions/{userId}
POST /api/subscriptions/{userId}/upgrade
POST /api/subscriptions/{userId}/cancel
\`\`\`

**Features**:
- Transaction logging
- Balance tracking
- Quota enforcement
- Webhook handling (Stripe)

**Why Separate?**
- High transaction volume
- Critical operations (ACID)
- Independent scaling
- Go's performance for concurrency

---

## Data Flow

### 1. Question Creation Flow

\`\`\`
User submits question
    ↓
[Client] Validate form (React Hook Form + Zod)
    ↓
[Server Action] createDoubt()
    ↓
[Validation] Zod schema validation
    ↓
[Database] Insert doubt into PostgreSQL
    ↓
[Points] Award 5 points to user
    ↓
[AI Service] Index question for search
    ↓
[Check] Check for achievements
    ↓
[Response] Return doubt ID + redirect
\`\`\`

### 2. AI Chat Flow

\`\`\`
User sends message
    ↓
[Client] Send to /api/ai-agent
    ↓
[Auth] Verify user session
    ↓
[Credits] Check user credits
    ↓
[AI Service] POST /api/chat
    ↓
[Embeddings] Generate query embedding
    ↓
[Search] Find relevant doubts (Elasticsearch)
    ↓
[LLM] Generate response (OpenAI)
    ↓
[Credits] Deduct credits
    ↓
[Response] Return AI response + sources
\`\`\`

### 3. Voting Flow

\`\`\`
User clicks upvote
    ↓
[Optimistic UI] Show upvote immediately
    ↓
[Server Action] handleVote()
    ↓
[Database Transaction]
    1. Insert/update vote
    2. Update doubt/comment votes count
    3. Award points to author
    ↓
[Revalidate] Update UI with real data
\`\`\`

### 4. Subscription Payment Flow

\`\`\`
User selects plan
    ↓
[Client] Redirect to Stripe Checkout
    ↓
[Stripe] Process payment
    ↓
[Webhook] POST /api/stripe/webhook
    ↓
[Verify] Validate webhook signature
    ↓
[Database] Update user subscription tier
    ↓
[Email] Send confirmation (planned)
    ↓
[Redirect] Back to app with success
\`\`\`

---

## Security Architecture

### Authentication & Authorization

\`\`\`
┌─────────────────────────────────┐
│      NextAuth.js Session        │
│                                 │
│  • JWT (default)                │
│  • Database sessions (Prisma)   │
│  • OAuth providers (Google)     │
│  • CSRF protection              │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│      Role-Based Access          │
│                                 │
│  • STUDENT: Ask, answer         │
│  • TEACHER: Verify answers      │
│  • ADMIN: Moderation            │
└─────────────────────────────────┘
\`\`\`

### Data Protection

1. **Input Validation**:
   - Client-side (React Hook Form)
   - Server-side (Zod schemas)
   - SQL injection prevention (Prisma)

2. **API Security**:
   - Rate limiting (planned)
   - CORS configuration
   - Authentication tokens
   - Webhook signature verification

3. **Environment Variables**:
   - Secrets in `.env.local`
   - Never committed to git
   - Replit Secrets in production

4. **Database Security**:
   - Encrypted connections (SSL)
   - Row-level security (Supabase)
   - Prepared statements (Prisma)

---

## Scalability Design

### Horizontal Scaling

**Next.js App**:
- Vercel Edge Network (global)
- Auto-scaling serverless functions
- CDN for static assets

**Microservices**:
- Container orchestration (Docker)
- Load balancing
- Independent scaling

**Database**:
- Connection pooling (Prisma)
- Read replicas (future)
- Caching (Redis - future)

### Performance Optimizations

1. **Frontend**:
   - React Server Components (less JS)
   - Code splitting (automatic)
   - Image optimization (Next.js)
   - Lazy loading

2. **Backend**:
   - Database indexing
   - Query optimization
   - Server-side caching
   - Edge functions

3. **Caching Strategy** (Planned):
   \`\`\`
   Browser Cache
       ↓
   CDN Cache (Vercel)
       ↓
   Redis Cache
       ↓
   Database
   \`\`\`

### Load Handling

**Expected Load**:
- 1,000 concurrent users (initial)
- 10,000+ doubts
- 100,000+ comments

**Capacity Planning**:
- Database: Connection pooling (100 connections)
- API: Rate limiting (100 req/min per user)
- AI Service: Queue system for high demand

---

## Deployment Architecture

### Production Setup

\`\`\`
┌─────────────────────────────────────────┐
│          Production Environment         │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Vercel (Next.js App)             │ │
│  │  • Edge Network                   │ │
│  │  • Auto HTTPS                     │ │
│  │  • Preview deployments            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Supabase (Database)              │ │
│  │  • PostgreSQL                     │ │
│  │  • Automatic backups              │ │
│  │  • Connection pooling             │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Railway (Microservices)          │ │
│  │  • AI Agent (Docker)              │ │
│  │  • Credits Service (Docker)       │ │
│  │  • Elasticsearch                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  External Services                │ │
│  │  • Stripe (Payments)              │ │
│  │  • OpenAI (LLM)                   │ │
│  │  • Resend (Email)                 │ │
│  │  • Sentry (Monitoring)            │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
\`\`\`

### CI/CD Pipeline

\`\`\`
GitHub Push
    ↓
GitHub Actions
    ↓
┌─────────────────┐
│  Run Tests      │
│  Type Check     │
│  Lint Code      │
│  Build          │
└─────────────────┘
    ↓
┌─────────────────┐
│ Deploy Preview  │
│ (PR branches)   │
└─────────────────┘
    ↓
Manual Approval
    ↓
┌─────────────────┐
│Deploy Production│
│  (main branch)  │
└─────────────────┘
\`\`\`

### Environment Strategy

\`\`\`
Development
├── localhost:5000 (Next.js)
├── Local PostgreSQL
└── Mock services

Staging (Planned)
├── staging.entropy.com
├── Supabase staging DB
└── Test services

Production
├── entropy.com
├── Supabase production DB
└── Production services
\`\`\`

---

## Database Architecture

### Schema Design

**Core Entities**:
- Users
- Doubts
- Comments
- Votes

**Gamification**:
- UserStats
- PointsLedger
- Achievements
- Badges
- Streaks
- Leaderboards

**AI Integration**:
- Conversations
- Messages
- AIRecommendations

### Data Relationships

\`\`\`
User (1) ──< (M) Doubt
User (1) ──< (M) Comment
User (1) ──── (1) UserStat
User (1) ──< (M) PointsLedger

Doubt (1) ──< (M) Comment
Doubt (1) ──< (M) Vote

Comment (1) ──< (M) Comment (nested)
Comment (1) ──< (M) Vote
\`\`\`

### Optimization Strategy

1. **Indexes**:
   - User email (unique)
   - Doubt subject + created_at
   - Comment doubt_id + created_at
   - Vote user_id + content_id

2. **Queries**:
   - Pagination (limit/offset)
   - Eager loading (Prisma include)
   - Selective fields (Prisma select)

3. **Caching** (Future):
   - User sessions (Redis)
   - Frequent queries (Redis)
   - Leaderboard (Redis sorted sets)

---

## Integration Points

### Internal Communication

\`\`\`
Next.js App ←→ PostgreSQL (Prisma)
Next.js App ←→ AI Agent (HTTP REST)
Next.js App ←→ Credits Service (HTTP REST)
AI Agent ←→ Elasticsearch (Native client)
AI Agent ←→ OpenAI (HTTP API)
Credits Service ←→ PostgreSQL (Direct)
\`\`\`

### External Integration

\`\`\`
Stripe Webhooks → Next.js API → Credits Service
OpenAI API → AI Agent → Response
Resend API → Email Service → Notifications
Sentry SDK → Error Tracking → Alerts
\`\`\`

### Authentication Flow

\`\`\`
User → Google OAuth → NextAuth.js → Session
Session → Prisma Adapter → Database
Microservices → Bearer Token → Validation
\`\`\`

---

## Future Roadmap

### Phase 1: MVP (Current)
- ✅ User authentication
- ✅ Doubt posting and comments
- ✅ Voting system
- ✅ Basic gamification
- 🚧 AI chat integration

### Phase 2: Enhanced Features (3 months)
- [ ] AI Agent service (FastAPI + Elasticsearch)
- [ ] Subscription system (Stripe)
- [ ] Email notifications
- [ ] Advanced search
- [ ] Mobile responsive

### Phase 3: Scale & Optimize (6 months)
- [ ] Redis caching
- [ ] Real-time notifications (WebSockets)
- [ ] Video explanations
- [ ] Peer-to-peer tutoring
- [ ] API for third-party integrations

### Phase 4: Enterprise (12 months)
- [ ] Multi-tenancy (universities)
- [ ] Analytics dashboard
- [ ] Content moderation AI
- [ ] Mobile apps (React Native)
- [ ] Internationalization

---

## Monitoring & Observability

### Metrics to Track

1. **Application**:
   - Response times
   - Error rates
   - API usage
   - Cache hit rates

2. **Business**:
   - Daily active users
   - Questions per day
   - Answer rate
   - Subscription conversions

3. **Infrastructure**:
   - Database connections
   - Memory usage
   - CPU usage
   - Disk I/O

### Tools

\`\`\`
Sentry
├── Error tracking
├── Performance monitoring
└── Release tracking

Vercel Analytics
├── Web vitals
├── Real user monitoring
└── Geographic distribution

Custom Dashboard (Planned)
├── Business metrics
├── User engagement
└── Revenue tracking
\`\`\`

---

## Design Principles

### 1. **Progressive Enhancement**
- Works without JavaScript (Server Components)
- Enhanced with JavaScript (Client Components)

### 2. **Security First**
- Input validation at every layer
- HTTPS everywhere
- Regular security audits

### 3. **Performance**
- Server-side rendering
- Optimized database queries
- Lazy loading
- Code splitting

### 4. **Scalability**
- Horizontal scaling (containers)
- Microservices for heavy operations
- Caching strategies
- CDN distribution

### 5. **Developer Experience**
- Type safety (TypeScript)
- Auto-generated API types (Prisma)
- Hot reload (Next.js)
- Comprehensive documentation

---

## Technical Debt & Maintenance

### Current Technical Debt
1. Missing LSP errors in auth.ts (minor)
2. No comprehensive test coverage
3. Limited error handling in some actions
4. No rate limiting yet

### Maintenance Plan

**Weekly**:
- Dependency updates
- Security patches
- Performance monitoring

**Monthly**:
- Database optimization
- Code quality review
- Documentation updates

**Quarterly**:
- Architecture review
- Scaling assessment
- Technology upgrades

---

## Summary

The Entropy platform is built with a **modern, scalable architecture** combining:
- **Next.js 14** for the main application (server-first approach)
- **Microservices** for complex features (AI, credits)
- **PostgreSQL** for reliable data storage
- **External services** for payments, AI, and communication

This architecture supports:
- ✅ Rapid feature development
- ✅ Easy scaling (horizontal + vertical)
- ✅ High performance (Server Components, caching)
- ✅ Security (multiple layers)
- ✅ Maintainability (TypeScript, documentation)

Ready for **thousands of users** and **millions of interactions**!
