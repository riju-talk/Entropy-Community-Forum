# External Services Documentation

This document lists all external services required or recommended for the Entropy Academic Platform.

---

## Core Services (Required)

### 1. PostgreSQL Database

**Provider Options**: Supabase, Neon, Railway, Render, AWS RDS

**Purpose**: Primary data storage for all application data

**Current Setup**: Supabase PostgreSQL

**Configuration**:
- Connection via `DATABASE_URL` environment variable
- Managed by Prisma ORM
- Supports all Prisma features (migrations, relations, transactions)

**Requirements**:
- PostgreSQL 12 or higher
- Minimum 1GB storage (scales with usage)
- SSL connection support

**Setup Guide**:
1. Create a PostgreSQL database
2. Copy connection string
3. Add to `DATABASE_URL` in environment variables
4. Run Prisma migrations: `npx prisma migrate deploy`

**Recommended Providers**:
- **Supabase** (Current): Free tier, easy setup, built-in auth options
- **Neon**: Serverless, auto-scaling, generous free tier
- **Railway**: Simple deployment, good free tier

---

### 2. NextAuth.js (Built-in)

**Purpose**: Authentication and session management

**Type**: Library (not external service)

**Features**:
- JWT-based sessions
- OAuth provider integration
- Database session storage via Prisma adapter
- Secure cookie handling

**Configuration**:
- Set in `lib/auth.ts`
- Requires `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

**No external service required** - runs within Next.js

---

## OAuth Providers (Optional)

### 3. Google OAuth

**Purpose**: Enable "Sign in with Google" functionality

**Setup Instructions**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret
8. Add to environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

**Cost**: Free

**Documentation**: https://next-auth.js.org/providers/google

---

### 4. GitHub OAuth

**Purpose**: Enable "Sign in with GitHub" functionality

**Setup Instructions**:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: "Entropy Academic Platform"
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to environment variables:
   - `GITHUB_ID`
   - `GITHUB_SECRET`

**Cost**: Free

**Documentation**: https://next-auth.js.org/providers/github

---

## AI & Search Services (Planned/Optional)

### 5. AI Agent Service (To Be Built)

**Purpose**: Intelligent question answering, recommendations, and chat

**Technology**: FastAPI + Python

**Features**:
- Natural language understanding
- Question recommendation
- Smart search suggestions
- Answer quality evaluation

**Setup**: See `docs/AI_AGENT.md` for complete architecture

**Environment Variables**:
- `AI_BACKEND_URL`: Service endpoint
- `AI_BACKEND_TOKEN`: Authentication token

**Deployment Options**:
- Dedicated server (Railway, Render, Fly.io)
- Serverless (AWS Lambda, Google Cloud Functions)
- Container (Docker on any provider)

---

### 6. Elasticsearch (Planned)

**Purpose**: Advanced search capabilities

**Provider Options**: Elastic Cloud, AWS OpenSearch, self-hosted

**Features**:
- Full-text search across questions/answers
- Fuzzy matching
- Search suggestions/autocomplete
- Analytics

**Configuration**:
- `ELASTICSEARCH_URL`: Cluster endpoint
- `ELASTICSEARCH_API_KEY`: Authentication

**Recommended**:
- Elastic Cloud free tier (14-day trial, then paid)
- AWS OpenSearch (pay as you go)

**Alternative**: PostgreSQL full-text search (current, limited)

---

### 7. Redis (Planned)

**Purpose**: Caching and session storage

**Provider Options**: Upstash, Redis Cloud, Railway

**Use Cases**:
- Cache frequently accessed data
- Rate limiting
- Real-time features
- Session storage (alternative to database)

**Configuration**:
- `REDIS_URL`: Connection string

**Recommended**:
- **Upstash**: Serverless Redis, generous free tier
- **Redis Cloud**: Managed Redis, 30MB free

---

## Payment & Subscription Services (Planned)

### 8. Stripe

**Purpose**: Payment processing for subscriptions and credits

**Features**:
- Subscription management
- Credit purchases
- Webhook handling
- Payment analytics

**Setup Instructions**:
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Configure subscription products and prices
5. Add environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

**Cost**: 
- Free to start
- 2.9% + $0.30 per transaction
- No monthly fees

**Documentation**: See `docs/PAYMENTS_STRIPE.md`

---

## Communication Services (Planned)

### 9. Email Service

**Purpose**: Send transactional emails and notifications

**Provider Options**: 
- SendGrid (12,000 emails/month free)
- Resend (100 emails/day free, modern API)
- AWS SES (62,000 emails/month free)
- Mailgun (5,000 emails/month free)

**Use Cases**:
- Email verification
- Password reset
- Notification emails
- Weekly digests

**Environment Variables**:
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

**Recommended**: **Resend** (best developer experience)

---

### 10. SMS Service (Future)

**Purpose**: SMS notifications for important updates

**Provider**: Twilio

**Use Cases**:
- Critical notifications
- 2FA (future feature)
- Urgent updates

**Cost**: Pay per message (~$0.0075 per SMS)

---

## Monitoring & Analytics (Recommended)

### 11. Application Monitoring

**Provider Options**:
- Sentry (error tracking) - 5k events/month free
- LogRocket (session replay) - 1k sessions/month free
- Vercel Analytics (if deploying to Vercel) - included

**Purpose**: 
- Error tracking
- Performance monitoring
- User session replay

**Recommended**: **Sentry** for error tracking

---

### 12. Analytics

**Provider Options**:
- Google Analytics - Free
- Plausible - Privacy-focused, paid
- PostHog - Open source, generous free tier

**Purpose**:
- User behavior tracking
- Feature usage analytics
- Conversion tracking

**Recommended**: **PostHog** (open source, privacy-friendly)

---

## File Storage (Future)

### 13. Object Storage

**Purpose**: Store user-uploaded images, documents, attachments

**Provider Options**:
- Supabase Storage (5GB free)
- AWS S3 (5GB free for 12 months)
- Cloudflare R2 (10GB free)
- Vercel Blob (if on Vercel)

**Use Cases**:
- Question images
- Profile pictures
- Document attachments
- Code snippets with syntax highlighting

**Recommended**: **Supabase Storage** (integrated with current database)

---

## CDN & Hosting (Deployment)

### 14. Application Hosting

**Provider Options**:
- **Vercel** (Recommended for Next.js)
  - Automatic deployments
  - Edge functions
  - Analytics included
  - Generous free tier
  
- **Railway**
  - Full-stack apps
  - Database included
  - $5/month credit
  
- **Render**
  - Static sites free
  - Web services from $7/month

**Current**: Replit (development)

**Production Recommendation**: **Vercel** for frontend + **Railway** for services

---

### 15. CDN

**Purpose**: Fast asset delivery globally

**Provider Options**:
- Vercel (included with hosting)
- Cloudflare (free tier)
- AWS CloudFront

**Recommended**: Use hosting provider's built-in CDN

---

## Development Tools

### 16. Database Management

**Tools**:
- **Prisma Studio**: Built-in database GUI (`npx prisma studio`)
- **pgAdmin**: PostgreSQL admin tool
- **TablePlus**: Universal database client (paid)
- **DBeaver**: Free, open-source database tool

**Recommended**: **Prisma Studio** (included with Prisma)

---

### 17. API Testing

**Tools**:
- **Postman**: API testing platform
- **Insomnia**: Lightweight alternative
- **Thunder Client**: VS Code extension

**Recommended**: **Thunder Client** (VS Code extension)

---

## Service Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Entropy Platform                      │
│                     (Next.js App)                        │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌─────────┐      ┌──────────┐    ┌──────────┐
    │PostgreSQL│      │  OAuth   │    │   AI     │
    │(Supabase)│      │Providers │    │ Service  │
    └─────────┘      └──────────┘    └──────────┘
          │                                 │
          │                                 ▼
          │                          ┌──────────────┐
          │                          │Elasticsearch │
          │                          └──────────────┘
          │
          ▼
    ┌──────────┐
    │  Redis   │
    │ (Cache)  │
    └──────────┘
          │
          ▼
    ┌──────────────────────────────┐
    │  Future Services             │
    │  • Stripe (Payments)         │
    │  • Email (Resend)            │
    │  • Storage (Supabase)        │
    │  • Monitoring (Sentry)       │
    └──────────────────────────────┘
\`\`\`

---

## Cost Estimation

### Free Tier (Development)
- Database: Free (Supabase/Neon)
- OAuth: Free (Google/GitHub)
- Hosting: Free (Vercel/Replit)
- **Total: $0/month**

### Production (Small Scale)
- Database: $0 (free tier) or $7/month
- AI Service: $5-10/month (Railway)
- Email: Free (Resend 100/day)
- Monitoring: Free (Sentry 5k events)
- **Total: ~$15/month**

### Production (Medium Scale)
- Database: $25/month (Supabase Pro)
- AI Service: $20/month
- Elasticsearch: $45/month (Elastic Cloud)
- Redis: $10/month (Upstash)
- Stripe: Pay per transaction
- Email: $20/month (SendGrid)
- Storage: $10/month
- Monitoring: $30/month (Sentry Team)
- **Total: ~$160/month**

---

## Next Steps

1. **Current**: Database (Supabase) ✅
2. **Phase 1**: Set up OAuth providers (Google/GitHub)
3. **Phase 2**: Deploy AI service (FastAPI)
4. **Phase 3**: Add Elasticsearch for search
5. **Phase 4**: Integrate Stripe for payments
6. **Phase 5**: Add Redis caching
7. **Phase 6**: Set up monitoring and analytics
