# Environment Variables

This doc lists only the unique variables used or optionally supported by the current app. When adding new features, extend this file instead of creating duplicates.

Important
- Client-side variables must be prefixed with NEXT_PUBLIC to be available in browser code. [^3]
- Changes to environment variables apply only to new deployments; redeploy to take effect. [^1][^2]

Required (Auth + Database)
- DATABASE_URL
  - Description: Postgres connection URL used by Prisma
  - Note: If your Prisma schema references POSTGRES_PRISMA_URL instead, set that instead of DATABASE_URL to avoid redundancy. Use only one primary database URL.

NextAuth (OAuth Providers)
- NEXTAUTH_SECRET
  - Description: Cryptographic secret used to sign NextAuth JWTs and cookies
  - Example: generate via `openssl rand -base64 32`
  - Required: YES
- NEXTAUTH_URL (optional in local dev, auto-detected on Vercel)
  - Description: Public base URL used for callbacks in some deployments
  - Example: https://your-app.vercel.app
- GITHUB_ID
  - Description: GitHub OAuth App Client ID
  - Required: YES
- GITHUB_SECRET
  - Description: GitHub OAuth App Client Secret
  - Required: YES
- GOOGLE_CLIENT_ID
  - Description: Google OAuth 2.0 Client ID
  - Required: YES
- GOOGLE_CLIENT_SECRET
  - Description: Google OAuth 2.0 Client Secret
  - Required: YES

Note: The app uses NextAuth with GitHub and Google OAuth providers. Firebase has been completely removed.

AI Backend (Required for Athena agent)
- AI_BACKEND_URL
  - Description: Base URL of your external AI microservice
  - Example: https://api.your-ai-service.com
- AI_BACKEND_TOKEN
  - Description: Bearer token for authenticating requests from /api/ai-agent to your AI service

Supabase (Optional, if you use Supabase client/storage)
- SUPABASE_URL
  - Description: Supabase project URL (server-side usage)
- SUPABASE_ANON_KEY
  - Description: Server-side anon key (use NEXT_PUBLIC_SUPABASE_ANON_KEY in browser)
- SUPABASE_SERVICE_ROLE_KEY
  - Description: Service role key (server-only; never expose to the client)
- NEXT_PUBLIC_SUPABASE_URL
  - Description: Public Supabase URL for client code
- NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Description: Public anon key for client code

Stripe (Optional, if you enable payments)
- STRIPE_SECRET_KEY
  - Description: Secret key for server-side Stripe calls
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - Description: Publishable key used on the client
- STRIPE_WEBHOOK_SECRET
  - Description: Webhook signing secret for verifying Stripe events

Email Service (Optional, for Nodemailer)
- SMTP_HOST
  - Description: SMTP server hostname (e.g., smtp.gmail.com)
  - Example: smtp.gmail.com
- SMTP_PORT
  - Description: SMTP server port (e.g., 587 for Gmail)
  - Example: 587
- SMTP_USER
  - Description: SMTP username/email
  - Example: your-email@gmail.com
- SMTP_PASS
  - Description: SMTP password or app password
  - Example: your-app-password

Vercel/Neon Postgres (Optional)
If you linked Vercel’s Postgres integration, you may see these injected automatically:
- POSTGRES_PRISMA_URL
- POSTGRES_URL
- POSTGRES_URL_NON_POOLING

Use only one database URL for Prisma. Prefer DATABASE_URL for simplicity. If your Prisma schema already references POSTGRES_PRISMA_URL, don’t duplicate; keep that single source of truth.

Best Practices
- Use NEXT_PUBLIC_ prefix for any variable that must be read on the client. [^3]
- Redeploy after changes; prior deployments won’t see updated values. [^1][^2]
- Store secrets at the Project (or Team) level in Vercel and avoid committing secrets to git.

Examples
Add the following (adjust values) to `.env.local` for auth + DB:

\`\`\`
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:XXXXXXXXXXXX:web:YYYYYYYYYYYYYYYY
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin (server)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Athena Agent Backend
AI_BACKEND_URL=https://api.your-ai-service.com
AI_BACKEND_TOKEN=super-secret-token
\`\`\`

References
- Vercel: Environment variables overview and lifecycle [^1][^2]
- v0: Full-stack workflow and client env guidelines [^3]
