# Technology Stack Documentation

> **Status**: ✅ Current Stack + 🔮 Planned Technologies

> ℹ️ **Mixed Document**: Lists currently used technologies and planned additions for future features.

Complete overview of all technologies used in the Entropy Academic Platform.

---

## Table of Contents
1. [Frontend Stack](#frontend-stack)
2. [Backend Stack](#backend-stack)
3. [Database & ORM](#database--orm)
4. [Authentication](#authentication)
5. [Microservices](#microservices)
6. [AI & ML](#ai--ml)
7. [External Services](#external-services)
8. [Development Tools](#development-tools)
9. [Deployment & DevOps](#deployment--devops)
10. [Package Versions](#package-versions)

---

## Frontend Stack

### Core Framework

#### Next.js 14
- **Version**: 14.2.16
- **Purpose**: React framework with App Router
- **Features**:
  - Server Components (RSC)
  - Server Actions
  - File-based routing
  - Automatic code splitting
  - Image optimization
  - API routes

**Why Next.js?**
- SEO-friendly (SSR/SSG)
- Excellent performance
- Built-in optimizations
- Vercel deployment ready

#### React 18
- **Version**: 18.x
- **Purpose**: UI library
- **Features**:
  - Concurrent rendering
  - Server Components
  - Automatic batching
  - Suspense for data fetching

#### TypeScript 5
- **Version**: 5.x
- **Purpose**: Type-safe development
- **Benefits**:
  - Catch errors at compile time
  - Better IDE support
  - Self-documenting code
  - Refactoring safety

---

### Styling & UI

#### Tailwind CSS 3
- **Version**: 3.4.17
- **Purpose**: Utility-first CSS framework
- **Features**:
  - Responsive design
  - Dark mode support
  - Custom theming
  - JIT compiler
- **Plugins**:
  - `tailwindcss-animate`: Animation utilities
  - `autoprefixer`: Browser compatibility

#### Radix UI
- **Purpose**: Unstyled, accessible component primitives
- **Components Used**:
  - `@radix-ui/react-avatar`: User avatars
  - `@radix-ui/react-checkbox`: Checkboxes
  - `@radix-ui/react-dialog`: Modals
  - `@radix-ui/react-dropdown-menu`: Dropdowns
  - `@radix-ui/react-label`: Form labels
  - `@radix-ui/react-progress`: Progress bars
  - `@radix-ui/react-select`: Select dropdowns
  - `@radix-ui/react-separator`: Dividers
  - `@radix-ui/react-slot`: Composition utility
  - `@radix-ui/react-switch`: Toggle switches
  - `@radix-ui/react-tabs`: Tab navigation
  - `@radix-ui/react-toast`: Notifications
  - `@radix-ui/react-tooltip`: Tooltips

**Why Radix UI?**
- Fully accessible (WCAG compliant)
- Unstyled (flexible styling)
- Composable
- Well-maintained

#### shadcn/ui Pattern
- **Purpose**: Component library built on Radix UI + Tailwind
- **Implementation**: Copy-paste components (not npm package)
- **Utilities**:
  - `class-variance-authority`: Component variants
  - `clsx`: Conditional classes
  - `tailwind-merge`: Merge Tailwind classes

#### next-themes
- **Purpose**: Theme management (light/dark mode)
- **Features**:
  - System preference detection
  - Persistent theme storage
  - No flash on page load

---

### Content & Forms

#### React Markdown
- **Package**: `react-markdown`
- **Purpose**: Render Markdown content
- **Plugins**:
  - `remark-gfm`: GitHub Flavored Markdown support
- **Usage**: Display formatted doubts and comments

#### Lucide React
- **Package**: `lucide-react`
- **Purpose**: Icon library
- **Features**:
  - Tree-shakeable
  - Consistent design
  - 1000+ icons

---

## Backend Stack

### Framework & Runtime

#### Next.js API Routes
- **Purpose**: Backend API endpoints
- **Features**:
  - Serverless functions
  - Edge runtime support
  - Middleware
  - Request/response handling

#### Server Actions
- **Purpose**: Server-side mutations
- **Benefits**:
  - No API routes needed
  - Type-safe
  - Automatic revalidation
  - Progressive enhancement

---

### Database & ORM

#### PostgreSQL 12+
- **Provider**: Supabase / Neon
- **Purpose**: Primary database
- **Features**:
  - ACID compliance
  - Complex queries
  - Full-text search
  - JSON support (JSONB)

#### Supabase
- **Purpose**: PostgreSQL hosting
- **Additional Features**:
  - Built-in auth (optional)
  - Real-time subscriptions
  - Storage (files)
  - Edge functions

#### Prisma ORM
- **Version**: Latest
- **Purpose**: Type-safe database client
- **Features**:
  - Auto-generated types
  - Migrations
  - Introspection
  - Query builder
  - Connection pooling

**Prisma Client**:
\`\`\`typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
\`\`\`

**Why Prisma?**
- Type safety
- Excellent DX
- Auto-completion
- Schema-first approach

---

### Validation

#### Zod
- **Version**: 4.1.12
- **Purpose**: Schema validation
- **Usage**:
  - Form validation
  - API request validation
  - Environment variables
  - Type inference

\`\`\`typescript
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
})
\`\`\`

---

## Authentication

### NextAuth.js
- **Package**: `next-auth` + `@auth/core` + `@auth/prisma-adapter`
- **Purpose**: Authentication solution
- **Features**:
  - OAuth providers (Google, GitHub)
  - JWT sessions
  - Database sessions
  - CSRF protection
  - Email/password (extensible)

**Providers Used**:
- Google OAuth
- GitHub OAuth (planned)

**Adapter**: Prisma Adapter (database sessions)

---

## Microservices

### AI Agent Service

#### FastAPI (Python)
- **Version**: 0.109.0
- **Purpose**: AI microservice backend
- **Features**:
  - Async support
  - Automatic OpenAPI docs
  - Pydantic validation
  - High performance

#### Sentence Transformers
- **Purpose**: Text embeddings
- **Model**: `all-MiniLM-L6-v2`
- **Usage**: Semantic search

#### Elasticsearch 8.x
- **Purpose**: Vector database
- **Features**:
  - Dense vector search
  - Full-text search
  - Hybrid search
  - Aggregations

#### LangChain
- **Purpose**: LLM orchestration
- **Features**:
  - Prompt templates
  - Chain composition
  - Memory management

#### OpenAI API
- **Purpose**: Chat completions
- **Model**: GPT-4 Turbo
- **Usage**: AI chat assistant

---

### Credits & Subscription Service

#### Go (Golang) 1.21
- **Purpose**: Credit management microservice
- **Libraries**:
  - `gorilla/mux`: HTTP router
  - `pgx`: PostgreSQL driver
  - `jwt-go`: JWT authentication

**OR**

#### Python FastAPI (Alternative)
- **Purpose**: Same as Go version
- **Libraries**:
  - `SQLAlchemy`: ORM
  - `asyncpg`: Async PostgreSQL
  - `python-jose`: JWT

---

## AI & ML

### Machine Learning

#### Sentence-BERT
- **Package**: `sentence-transformers`
- **Model**: `all-MiniLM-L6-v2`
- **Dims**: 384
- **Purpose**: Text embeddings for search

#### OpenAI
- **Package**: `openai`
- **Version**: 1.10.0
- **Models**:
  - GPT-4 Turbo (chat)
  - GPT-3.5 Turbo (fallback)

#### Anthropic Claude (Optional)
- **Package**: `anthropic`
- **Model**: Claude 3
- **Purpose**: Alternative LLM

#### scikit-learn
- **Purpose**: ML utilities
- **Usage**:
  - Similarity calculations
  - Data preprocessing

---

## External Services

### Payments

#### Stripe
- **Package**: `stripe` + `@stripe/stripe-js` + `@stripe/react-stripe-js`
- **Purpose**: Payment processing
- **Features**:
  - Subscriptions
  - One-time payments
  - Webhooks
  - Customer portal

---

### Email (Planned)

#### Nodemailer
- **Purpose**: Transactional emails
- **Features**:
  - SMTP-based email sending
  - HTML and text support
  - Attachment support
  - Custom transport options

---

### File Storage (Planned)

#### Supabase Storage
- **Purpose**: User uploads
- **Features**:
  - S3-compatible
  - CDN delivery
  - Image transformations

---

## Development Tools

### Code Quality

#### ESLint
- **Version**: 8.x
- **Config**: `eslint-config-next`
- **Purpose**: Code linting
- **Rules**: Next.js recommended

#### TypeScript
- **Purpose**: Static type checking
- **Config**: Strict mode
- **Features**:
  - Path aliases (`@/`)
  - Incremental compilation

---

### Build Tools

#### PostCSS
- **Version**: 8.5+
- **Purpose**: CSS processing
- **Plugins**:
  - Tailwind CSS
  - Autoprefixer

#### Vite (Development)
- **Purpose**: Dev server (if using Vite mode)
- **Features**:
  - Hot module replacement
  - Fast refresh
  - Plugin ecosystem

#### Terser
- **Purpose**: JavaScript minification
- **Usage**: Production builds

---

### Testing (Recommended)

#### Jest
- **Purpose**: Unit testing
- **Config**: Next.js integration

#### React Testing Library
- **Purpose**: Component testing
- **Philosophy**: Test user behavior

#### Playwright
- **Purpose**: E2E testing
- **Features**:
  - Multi-browser
  - Auto-wait
  - Screenshots

---

## Deployment & DevOps

### Hosting

#### Vercel
- **Purpose**: Next.js hosting (recommended)
- **Features**:
  - Zero-config deployment
  - Edge network
  - Preview deployments
  - Analytics
  - Automatic HTTPS

#### Railway
- **Purpose**: Microservices hosting
- **Features**:
  - Docker support
  - Database included
  - Auto-scaling
  - $5/month credit

#### Replit (Development)
- **Purpose**: Development environment
- **Features**:
  - Cloud IDE
  - Collaborative coding
  - Instant deployment

---

### Containerization

#### Docker
- **Purpose**: Containerization
- **Images**:
  - `node:18-alpine`: Next.js app
  - `python:3.11-slim`: AI service
  - `golang:1.21-alpine`: Credits service

---

### CI/CD

#### GitHub Actions (Recommended)
- **Purpose**: Continuous integration
- **Workflows**:
  - Run tests on PR
  - Type checking
  - Linting
  - Auto-deploy to Vercel

---

### Monitoring

#### Sentry (Recommended)
- **Purpose**: Error tracking
- **Features**:
  - Source maps
  - Release tracking
  - Performance monitoring

#### Vercel Analytics
- **Purpose**: Web analytics
- **Features**:
  - Real User Monitoring (RUM)
  - Web Vitals
  - Privacy-friendly

---

## Package Versions

### Core Dependencies

\`\`\`json
{
  "dependencies": {
    "next": "14.2.16",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    
    "@prisma/client": "latest",
    "prisma": "latest",
    
    "next-auth": "latest",
    "@auth/core": "latest",
    "@auth/prisma-adapter": "^2.11.0",
    
    "zod": "^4.1.12",
    
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.0.1",
    "postcss": "^8.5",
    
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    
    "lucide-react": "^0.454.0",
    "react-markdown": "latest",
    "remark-gfm": "latest",
    
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7"
  }
}
\`\`\`

### Dev Dependencies

\`\`\`json
{
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.0.4"
  }
}
\`\`\`

---

## Architecture Decisions

### Why This Stack?

1. **Next.js 14**: Modern React framework with excellent DX
2. **TypeScript**: Type safety prevents bugs
3. **Prisma**: Best-in-class ORM for TypeScript
4. **Tailwind CSS**: Rapid UI development
5. **Radix UI**: Accessible, unstyled primitives
6. **NextAuth.js**: Robust auth solution
7. **PostgreSQL**: Reliable, feature-rich database
8. **Vercel**: Optimized for Next.js

### Performance Optimizations

- **Server Components**: Reduce client-side JavaScript
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Edge Runtime**: Fast global response times
- **Database Indexing**: Optimized queries
- **Caching**: Redis for frequently accessed data

---

## Version Management

### Node.js
- **Recommended**: 18.x or 20.x
- **Manager**: nvm or fnm

### Package Manager
- **Recommended**: npm or pnpm
- **Lock File**: package-lock.json or pnpm-lock.yaml

### Environment
- **Development**: Node.js 18+
- **Production**: Vercel (Node.js 18.x)

---

## Future Tech Additions

### Planned
- **Redis**: Caching layer
- **Elasticsearch**: Advanced search
- **Stripe**: Payment processing
- **Nodemailer**: Email service
- **Sentry**: Error monitoring
- **Docker**: Production containers

---

This modern, scalable tech stack powers the Entropy platform efficiently!
