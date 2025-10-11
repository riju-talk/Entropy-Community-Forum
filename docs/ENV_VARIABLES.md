# Environment Variables Documentation

This document lists all environment variables required for the Entropy Academic Platform, their purposes, and where they are used.

## Required Environment Variables

### Database Configuration

#### `DATABASE_URL`
- **Purpose**: PostgreSQL database connection string
- **Required**: Yes
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- **Used In**: 
  - `prisma/schema.prisma` (line 7)
  - `lib/prisma.ts` (Prisma Client initialization)
- **Why**: Connects Prisma ORM to PostgreSQL database (Supabase/Neon) for all data operations
- **Example**: `postgresql://postgres:password@db.example.com:5432/entropy`

---

### Authentication & Security

#### `NEXTAUTH_URL`
- **Purpose**: Base URL for NextAuth.js authentication
- **Required**: Yes
- **Format**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)
- **Used In**: 
  - NextAuth.js configuration (automatic)
  - `lib/auth.ts` (implicitly)
- **Why**: Required by NextAuth.js to generate correct callback URLs and handle OAuth flows
- **Example**: 
  - Dev: `http://localhost:5000`
  - Prod: `https://entropy-platform.com`

#### `NEXTAUTH_SECRET`
- **Purpose**: Secret key for encrypting JWT tokens and sessions
- **Required**: Yes
- **Format**: Random string (minimum 32 characters recommended)
- **Used In**: 
  - NextAuth.js configuration (automatic)
  - Session encryption/decryption
- **Why**: Secures user sessions and prevents token tampering
- **Generate**: `openssl rand -base64 32`
- **Example**: `your-super-secret-key-min-32-chars-long`

---

### OAuth Providers (Optional but Recommended)

#### `GOOGLE_CLIENT_ID`
- **Purpose**: Google OAuth application client ID
- **Required**: No (optional for Google sign-in)
- **Format**: Google client ID string
- **Used In**: 
  - `lib/auth.ts` (line 10)
  - GoogleProvider configuration
- **Why**: Enables "Sign in with Google" functionality
- **How to Get**: Create OAuth app at https://console.cloud.google.com
- **Example**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

#### `GOOGLE_CLIENT_SECRET`
- **Purpose**: Google OAuth application client secret
- **Required**: No (optional, paired with GOOGLE_CLIENT_ID)
- **Format**: Google secret string
- **Used In**: 
  - `lib/auth.ts` (line 11)
  - GoogleProvider configuration
- **Why**: Authenticates the application with Google OAuth servers
- **Example**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

#### `GITHUB_ID`
- **Purpose**: GitHub OAuth application client ID
- **Required**: No (optional for GitHub sign-in)
- **Format**: GitHub client ID string
- **Used In**: 
  - `lib/auth.ts` (if GitHub provider is added)
  - Mentioned in `README.md` (line 90)
- **Why**: Enables "Sign in with GitHub" functionality
- **How to Get**: Create OAuth app at https://github.com/settings/developers
- **Example**: `Iv1.abcdef1234567890`

#### `GITHUB_SECRET`
- **Purpose**: GitHub OAuth application client secret
- **Required**: No (optional, paired with GITHUB_ID)
- **Format**: GitHub secret string
- **Used In**: 
  - `lib/auth.ts` (if GitHub provider is added)
  - Mentioned in `README.md` (line 91)
- **Why**: Authenticates the application with GitHub OAuth servers
- **Example**: `1234567890abcdefghijklmnopqrstuvwxyz123456`

---

### AI Integration

#### `AI_BACKEND_URL`
- **Purpose**: URL endpoint for AI agent/chatbot backend service
- **Required**: No (optional for AI features)
- **Format**: Full HTTP/HTTPS URL
- **Used In**: 
  - `app/api/ai-agent/route.ts` (line 8)
- **Why**: Connects to external AI service (FastAPI) for intelligent question answering and recommendations
- **Default**: `https://your-ai-backend.com/api/chat`
- **Example**: `https://ai-service.entropy.com/api/chat`

#### `AI_BACKEND_TOKEN`
- **Purpose**: Authentication token for AI backend service
- **Required**: No (optional, paired with AI_BACKEND_URL)
- **Format**: Bearer token string
- **Used In**: 
  - `app/api/ai-agent/route.ts` (line 14)
- **Why**: Secures communication with AI backend service
- **Example**: `sk-ai-token-abcdef1234567890`

---

### Future/Planned Environment Variables

The following variables are planned for upcoming features but not yet implemented:

#### `STRIPE_SECRET_KEY`
- **Purpose**: Stripe API secret key for payment processing
- **Required**: No (for subscription/credits feature)
- **Used In**: Payment integration (planned)
- **Why**: Process payments for premium subscriptions and credit purchases

#### `STRIPE_WEBHOOK_SECRET`
- **Purpose**: Stripe webhook signing secret
- **Required**: No (with Stripe integration)
- **Used In**: Webhook handlers (planned)
- **Why**: Verify Stripe webhook authenticity

#### `ELASTICSEARCH_URL`
- **Purpose**: Elasticsearch cluster URL for advanced search
- **Required**: No (for search service)
- **Used In**: Search service (planned)
- **Why**: Enable fast, fuzzy search across questions and answers

#### `REDIS_URL`
- **Purpose**: Redis connection string for caching
- **Required**: No (for performance optimization)
- **Used In**: Caching layer (planned)
- **Why**: Cache frequently accessed data and session storage

#### `EMAIL_SERVER_HOST`
- **Purpose**: SMTP server hostname for email notifications
- **Required**: No (for email features)
- **Used In**: Email service (planned)
- **Why**: Send notification emails to users

#### `EMAIL_SERVER_PORT`
- **Purpose**: SMTP server port
- **Required**: No (with email server)
- **Used In**: Email service (planned)

#### `EMAIL_SERVER_USER`
- **Purpose**: SMTP authentication username
- **Required**: No (with email server)
- **Used In**: Email service (planned)

#### `EMAIL_SERVER_PASSWORD`
- **Purpose**: SMTP authentication password
- **Required**: No (with email server)
- **Used In**: Email service (planned)

#### `EMAIL_FROM`
- **Purpose**: Default sender email address
- **Required**: No (with email server)
- **Used In**: Email service (planned)

---

## Environment Setup Instructions

### Development (.env.local)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/entropy_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:5000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# AI Integration (optional)
AI_BACKEND_URL="http://localhost:8000/api/chat"
AI_BACKEND_TOKEN="dev-token-123"
```

### Production (.env.production)

```env
# Database
DATABASE_URL="postgresql://user:pass@production-db.com:5432/entropy_prod"

# NextAuth
NEXTAUTH_URL="https://entropy-platform.com"
NEXTAUTH_SECRET="production-secret-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="prod-google-client-id"
GOOGLE_CLIENT_SECRET="prod-google-client-secret"

# AI Integration
AI_BACKEND_URL="https://ai.entropy-platform.com/api/chat"
AI_BACKEND_TOKEN="prod-ai-token-secure"

# Stripe (when implemented)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Replit Deployment

For Replit deployment, set these as **Secrets** in the Replit UI:
- All production values
- Never commit secrets to version control
- Use Replit's built-in secret management

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different values** for development and production
3. **Rotate secrets regularly**, especially NEXTAUTH_SECRET
4. **Use strong secrets** (minimum 32 characters)
5. **Limit OAuth redirect URIs** to your actual domains
6. **Enable 2FA** on all OAuth provider accounts
7. **Use environment-specific databases** (dev/staging/prod)
8. **Audit access** to production environment variables regularly

---

## Troubleshooting

### Common Issues

**Error: `NEXTAUTH_URL` not set**
- Solution: Add `NEXTAUTH_URL` to your `.env.local` file

**Error: Prisma connection failed**
- Solution: Verify `DATABASE_URL` format and database accessibility

**OAuth Error: Invalid redirect URI**
- Solution: Ensure `NEXTAUTH_URL` matches OAuth app configuration

**AI Service Error: 401 Unauthorized**
- Solution: Check `AI_BACKEND_TOKEN` is correct and service is running
