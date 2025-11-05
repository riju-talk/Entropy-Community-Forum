# Authentication Setup Summary

## Overview
This document describes the complete NextAuth setup with protected routes and proper session management.

## Changes Made

### 1. ✅ Updated `lib/auth.ts`
**Key Changes:**
- Added `signIn` callback to automatically sync users to database on first login
- Enhanced `jwt` callback to fetch latest user data from database
- Added proper session configuration with 30-day expiry
- Added `secret` configuration for NextAuth
- Improved type safety for session and JWT tokens

**Features:**
- Automatic user creation/update in database on sign-in
- JWT tokens include user ID from database
- Session properly hydrates with user data
- 30-day session duration

### 2. ✅ Updated `middleware.ts`
**Key Changes:**
- Uses `getToken` from `next-auth/jwt` for proper authentication check
- Protects `/profile` and `/create-community` routes
- Adds `callbackUrl` to signin redirect for better UX
- Maintains security headers for API routes

**Protected Routes:**
- `/profile` - User profile page
- `/create-community` - Community creation page

### 3. ✅ Updated `components/auth-provider.tsx`
**Key Changes:**
- Added `refetchInterval: 5 * 60` (5 minutes)
- Added `refetchOnWindowFocus: true`
- Ensures session stays fresh and synchronized

### 4. ✅ Updated `app/auth/signin/page.tsx`
**Key Changes:**
- Reads `callbackUrl` from URL search params
- Redirects authenticated users automatically
- Handles OAuth provider errors properly
- Shows loading state while checking authentication

### 5. ✅ Updated `app/profile/page.tsx`
**Key Changes:**
- Added client-side redirect for unauthenticated users
- Redirects to `/auth/signin?callbackUrl=/profile`
- Shows loading spinner during redirect
- Uses `useSession()` for real-time auth status

### 6. ✅ Removed Redundant Routes
**Deleted Files:**
- `/api/auth/session/route.ts` - NextAuth provides this automatically at `/api/auth/session`
- `/api/auth/sync/route.ts` - User sync now happens in `signIn` callback

### 7. ✅ Updated Documentation
**Updated `docs/ENV_VARIABLES.md`:**
- Removed all Firebase-related variables
- Added proper NextAuth OAuth variables
- Clarified required environment variables

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000" # Optional in dev, required in production

# GitHub OAuth App
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Setup OAuth Apps

#### GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set:
   - Application name: `Entropy Community Forum`
   - Homepage URL: `http://localhost:3000` (dev) or your production URL
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate a Client Secret

#### Google OAuth 2.0
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Set:
   - Application type: `Web application`
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret

## How It Works

### Authentication Flow
1. User visits protected route (e.g., `/profile`)
2. Middleware checks for valid JWT token
3. If no token, redirects to `/auth/signin?callbackUrl=/profile`
4. User signs in with GitHub or Google
5. NextAuth creates session and JWT token
6. `signIn` callback syncs user to database
7. User redirected back to original page (callbackUrl)

### Session Management
- **Server-side**: Use `getServerSession(authOptions)` in API routes and Server Components
- **Client-side**: Use `useSession()` hook from `next-auth/react`
- **Middleware**: Use `getToken()` from `next-auth/jwt`

### Session Refresh
- Session refetches every 5 minutes automatically
- Session refetches when browser window regains focus
- Session persists for 30 days unless user signs out

## API Routes

### NextAuth Routes (Automatic)
- `GET/POST /api/auth/session` - Get current session
- `GET /api/auth/signin` - Sign in page redirect
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/callback/github` - GitHub OAuth callback
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/csrf` - CSRF token

### Custom Routes
- `GET /api/users/me/profile` - Get authenticated user profile with stats

## Protected Routes

Add routes to the `protectedRoutes` array in `middleware.ts`:

```typescript
const protectedRoutes = [
  '/create-community',
  '/profile',
  '/your-new-protected-route'
]
```

## Checking Authentication

### In Server Components
```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function Page() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    // Not authenticated
  }
  
  // Use session.user.id, session.user.email, etc.
}
```

### In Client Components
```typescript
"use client"
import { useSession } from "next-auth/react"

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    // Loading...
  }
  
  if (status === "unauthenticated") {
    // Not authenticated
  }
  
  // Use session.user.id, session.user.email, etc.
}
```

### In API Routes
```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Proceed with authenticated logic
}
```

### In Middleware
```typescript
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  if (!token) {
    // Not authenticated
  }
}
```

## Testing

### Test Authentication
1. Start dev server: `npm run dev`
2. Visit `/profile` without signing in
3. Should redirect to `/auth/signin?callbackUrl=/profile`
4. Sign in with GitHub or Google
5. Should redirect back to `/profile` with your data

### Test Session Persistence
1. Sign in
2. Close browser tab
3. Reopen and visit protected route
4. Should still be authenticated (session persists)

### Test Session Refresh
1. Sign in
2. Check session: `console.log(session)`
3. Wait 5 minutes
4. Session should auto-refresh with latest data

## Troubleshooting

### useSession() returns null
**Possible causes:**
1. `NEXTAUTH_SECRET` not set or incorrect
2. OAuth credentials (`GITHUB_ID`, `GOOGLE_CLIENT_ID`, etc.) not set
3. SessionProvider not wrapping the app in layout
4. Cookie domain mismatch (check browser dev tools > Application > Cookies)

**Solutions:**
1. Verify all environment variables are set correctly
2. Restart dev server after changing `.env.local`
3. Clear browser cookies and try again
4. Check browser console for errors

### Redirect loop on protected routes
**Cause:** Middleware not finding valid token

**Solutions:**
1. Check `NEXTAUTH_SECRET` matches between auth config and middleware
2. Verify cookie name (should be `next-auth.session-token` in dev)
3. Check browser cookies are being set

### User not synced to database
**Cause:** Database connection issue or Prisma schema mismatch

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Run `npx prisma db push` to sync schema
3. Check `signIn` callback logs in console
4. Verify User model exists in Prisma schema

## Security Considerations

- ✅ JWT tokens are httpOnly and secure cookies
- ✅ CSRF protection enabled by default in NextAuth
- ✅ Session tokens expire after 30 days
- ✅ OAuth state parameter prevents CSRF attacks
- ✅ Database queries use parameterized Prisma queries (SQL injection safe)
- ✅ Middleware adds security headers to API routes
- ✅ Protected routes require valid JWT token

## Next Steps

To add more OAuth providers:
1. Import provider from `next-auth/providers`
2. Add to `providers` array in `authOptions`
3. Add environment variables for client ID and secret
4. Update documentation

Example:
```typescript
import DiscordProvider from "next-auth/providers/discord"

providers: [
  // ... existing providers
  DiscordProvider({
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  }),
]
```
