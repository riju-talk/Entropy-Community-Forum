# Environment Variables

This doc lists only the unique variables used or optionally supported by the current app. When adding new features, extend this file instead of creating duplicates.

Important
- Client-side variables must be prefixed with NEXT_PUBLIC to be available in browser code. [^3]
- Changes to environment variables apply only to new deployments; redeploy to take effect. [^1][^2]

Required (Auth + Database)
- NEXTAUTH_URL
  - Description: Site URL for NextAuth callbacks and links
  - Example: https://your-app.vercel.app
- NEXTAUTH_SECRET
  - Description: Cryptographic secret for NextAuth
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
  - Description: Google OAuth provider credentials
- GITHUB_ID / GITHUB_SECRET
  - Description: GitHub OAuth provider credentials
- DATABASE_URL
  - Description: Postgres connection URL used by Prisma
  - Note: If your Prisma schema references POSTGRES_PRISMA_URL instead, set that instead of DATABASE_URL to avoid redundancy. Use only one primary database URL.

AI Backend (Required for Athena)
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
See .env.example for a ready-to-copy template.

References
- Vercel: Environment variables overview and lifecycle [^1][^2]
- v0: Full-stack workflow and client env guidelines [^3]
