# Entropy Platform Documentation

**Documentation Type**: Design Specifications & Implementation Roadmap

> ⚠️ **Important**: This documentation includes both **current implementation** and **future design specifications**. Each document clearly indicates what's implemented vs. planned.

Complete documentation for building and scaling the Entropy Academic Platform.

---

## 📚 Table of Contents

### Getting Started
1. **[Environment Variables](ENV_VARIABLES.md)** - All required environment variables and their purposes
2. **[Tech Stack](TECH_STACK.md)** - Complete technology stack overview
3. **[Project Architecture](PROJECT_ARCHITECTURE.md)** - System design and architecture patterns

### Core Systems
4. **[Database Schema](DATABASE.md)** - Complete PostgreSQL database design
5. **[External Services](SERVICES.md)** - Third-party services and integrations

### Microservices Design
6. **[AI Agent Service](AI_AGENT.md)** - FastAPI + Elasticsearch implementation guide
7. **[Credits & Subscription](CREDITS_SUBSCRIPTION.md)** - Go/Python microservice for billing
8. **[Stripe Payments](PAYMENTS_STRIPE.md)** - Payment integration guide

### Gamification
9. **[Achievements & Badges](ACHIEVEMENTS_BADGES.md)** - Complete gamification system

---

## 🚀 Quick Start

### For Developers

1. **Setup Environment**
   ```bash
   # Clone repository
   git clone <repo-url>
   cd entropy-platform
   
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env.local
   ```

2. **Configure Environment** (see [ENV_VARIABLES.md](ENV_VARIABLES.md))
   - Set up DATABASE_URL (PostgreSQL)
   - Configure NEXTAUTH_SECRET
   - Add OAuth credentials (optional)

3. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Seed database
   npx prisma db seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

---

## 📖 Documentation Guide

### 1. Environment Variables ([ENV_VARIABLES.md](ENV_VARIABLES.md))
**What**: List of all environment variables needed
**When to read**: 
- Setting up local development
- Deploying to production
- Troubleshooting configuration issues

**Key sections**:
- Required vs optional variables
- OAuth provider setup
- Service API keys
- Security best practices

---

### 2. Tech Stack ([TECH_STACK.md](TECH_STACK.md))
**What**: Complete list of technologies used
**When to read**:
- Understanding the codebase
- Adding new dependencies
- Evaluating alternatives

**Key sections**:
- Frontend stack (Next.js, React, Tailwind)
- Backend stack (API routes, Server Actions)
- Database (PostgreSQL, Prisma)
- External services

---

### 3. Project Architecture ([PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md))
**What**: High-level system design
**When to read**:
- Understanding how everything fits together
- Planning new features
- Scaling the application

**Key sections**:
- System overview diagram
- Architecture patterns
- Data flow diagrams
- Deployment architecture
- Future roadmap

---

### 4. Database Schema ([DATABASE.md](DATABASE.md))
**What**: Complete database design and relationships
**When to read**:
- Adding new models
- Writing complex queries
- Understanding data relationships

**Key sections**:
- Core tables (Users, Doubts, Comments)
- Gamification tables
- AI integration tables
- Indexes and optimizations
- Migration guide

---

### 5. External Services ([SERVICES.md](SERVICES.md))
**What**: Third-party services documentation
**When to read**:
- Integrating new services
- Understanding dependencies
- Cost estimation

**Key sections**:
- Database (Supabase/Neon)
- OAuth providers (Google, GitHub)
- AI services (OpenAI, Elasticsearch)
- Payment (Stripe)
- Email (Resend)
- Monitoring (Sentry)

---

### 6. AI Agent Service ([AI_AGENT.md](AI_AGENT.md))
**What**: Complete implementation guide for AI microservice
**When to read**:
- Building the AI service
- Implementing semantic search
- Integrating with main app

**Key sections**:
- FastAPI setup
- Elasticsearch configuration
- Embedding service (Sentence-BERT)
- LLM integration (OpenAI)
- API endpoints
- Deployment guide

**Perfect for**: Feeding to Claude/ChatGPT to generate code

---

### 7. Credits & Subscription ([CREDITS_SUBSCRIPTION.md](CREDITS_SUBSCRIPTION.md))
**What**: Microservice for managing credits and subscriptions
**When to read**:
- Building billing system
- Implementing credit system
- Quota management

**Key sections**:
- Go implementation
- Python FastAPI alternative
- API endpoints
- Database schema
- Stripe webhook integration

---

### 8. Stripe Payments ([PAYMENTS_STRIPE.md](PAYMENTS_STRIPE.md))
**What**: Complete Stripe integration guide
**When to read**:
- Implementing subscriptions
- Adding credit purchases
- Handling webhooks

**Key sections**:
- Stripe setup
- Checkout session
- Subscription management
- Webhook handling
- Testing guide

---

### 9. Achievements & Badges ([ACHIEVEMENTS_BADGES.md](ACHIEVEMENTS_BADGES.md))
**What**: Gamification system implementation
**When to read**:
- Implementing points system
- Adding achievements
- Building leaderboards

**Key sections**:
- Points system
- Achievement definitions
- Badge logic
- Streak tracking
- Leaderboard generation
- Integration points

---

## 🏗️ Building Microservices

### AI Agent Service

```bash
# Navigate to AI service directory
cd ai-agent-service

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

See [AI_AGENT.md](AI_AGENT.md) for complete implementation.

### Credits Service

```bash
# Go version
cd credits-service
go run cmd/server/main.go

# Python version
cd credits-service
uvicorn app.main:app --port 8080
```

See [CREDITS_SUBSCRIPTION.md](CREDITS_SUBSCRIPTION.md) for details.

---

## 🔧 Development Workflow

### 1. Local Development
- Main app: `npm run dev` (port 5000)
- AI service: `uvicorn app.main:app --reload` (port 8000)
- Credits service: `go run main.go` (port 8080)

### 2. Database Changes
```bash
# Make schema changes in prisma/schema.prisma
npx prisma migrate dev --name your_change

# Generate Prisma Client
npx prisma generate
```

### 3. Adding Features
1. Update database schema if needed
2. Create Server Action or API route
3. Build UI components
4. Test locally
5. Deploy

---

## 🚢 Deployment

### Main Application
```bash
# Vercel (recommended)
vercel --prod

# or connect GitHub repo to Vercel
```

### Microservices
```bash
# Docker build
docker build -t ai-agent-service .
docker run -p 8000:8000 ai-agent-service

# Deploy to Railway/Render
railway up
# or
render deploy
```

See [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) for deployment architecture.

---

## 📊 Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Next.js App       │
│  (Main Platform)    │
└──────┬──────┬───────┘
       │      │
   ┌───▼──┐ ┌▼────────────┐
   │  DB  │ │Microservices│
   │(PG)  │ │ • AI Agent  │
   └──────┘ │ • Credits   │
            └─────────────┘
```

---

## 🎯 Feature Implementation Guide

### Want to add a new feature?

1. **Read** [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) - Understand the system
2. **Check** [DATABASE.md](DATABASE.md) - See if schema changes needed
3. **Review** [TECH_STACK.md](TECH_STACK.md) - Know available tools
4. **Follow** patterns in existing code
5. **Test** locally before deploying

### Want to add AI features?

1. **Read** [AI_AGENT.md](AI_AGENT.md) completely
2. Use it as a specification for implementation
3. Can feed entire doc to Claude/ChatGPT for code generation

### Want to add payments?

1. **Read** [PAYMENTS_STRIPE.md](PAYMENTS_STRIPE.md)
2. Follow step-by-step integration guide
3. Test with Stripe test cards

### Want to add gamification?

1. **Read** [ACHIEVEMENTS_BADGES.md](ACHIEVEMENTS_BADGES.md)
2. Implement points system
3. Add achievement checks
4. Build leaderboards

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] All environment variables set (see [ENV_VARIABLES.md](ENV_VARIABLES.md))
- [ ] OAuth redirect URIs configured correctly
- [ ] Database connection uses SSL
- [ ] Stripe webhook signature validation enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] CORS configured properly
- [ ] No secrets in client-side code

---

## 📈 Scaling Guide

### When to scale what?

**<1,000 users**:
- Current setup is fine
- Monitor performance

**1,000-10,000 users**:
- Add Redis caching
- Enable database read replicas
- Implement rate limiting

**10,000+ users**:
- Scale microservices horizontally
- Add CDN for static assets
- Consider multi-region deployment

See [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) for scaling strategies.

---

## 🤝 Contributing

### For New Developers

1. Read [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md) first
2. Understand [DATABASE.md](DATABASE.md) schema
3. Set up environment using [ENV_VARIABLES.md](ENV_VARIABLES.md)
4. Follow coding patterns in [TECH_STACK.md](TECH_STACK.md)

### For Team Leads

Use these docs to:
- Onboard new developers
- Plan sprint work
- Estimate effort
- Design new features

---

## 📝 Notes

### Document Updates

These documents should be updated when:
- Adding new environment variables → Update [ENV_VARIABLES.md](ENV_VARIABLES.md)
- Changing database schema → Update [DATABASE.md](DATABASE.md)
- Adding new services → Update [SERVICES.md](SERVICES.md)
- Modifying architecture → Update [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)

### Code Generation

Documents designed for AI assistance:
- [AI_AGENT.md](AI_AGENT.md) - Feed to Claude for full service code
- [PAYMENTS_STRIPE.md](PAYMENTS_STRIPE.md) - Complete integration code
- [ACHIEVEMENTS_BADGES.md](ACHIEVEMENTS_BADGES.md) - Implementation examples

---

## 🎓 Learning Path

### Week 1: Understand the System
- [ ] Read [PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)
- [ ] Review [TECH_STACK.md](TECH_STACK.md)
- [ ] Study [DATABASE.md](DATABASE.md)

### Week 2: Set Up Environment
- [ ] Follow [ENV_VARIABLES.md](ENV_VARIABLES.md)
- [ ] Set up local database
- [ ] Run the application

### Week 3: Build Features
- [ ] Pick a feature from roadmap
- [ ] Implement using docs as guide
- [ ] Test and deploy

---

## 📞 Getting Help

If you're stuck:

1. **Check the docs** - Likely answered here
2. **Search the codebase** - Look for similar patterns
3. **Review Prisma schema** - Understanding data helps
4. **Ask the team** - We're here to help

---

## 🎉 Success!

You now have comprehensive documentation to:
- ✅ Build the complete Entropy platform
- ✅ Scale to thousands of users
- ✅ Add new features confidently
- ✅ Maintain code quality
- ✅ Deploy to production

**Let's build something amazing! 🚀**
