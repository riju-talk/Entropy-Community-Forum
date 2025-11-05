# Quick Setup Guide - Authentication

## 🚀 Quick Start

### 1. Install Dependencies (if needed)
```bash
npm install next-auth@latest
```

### 2. Create `.env.local` file in `apps/app/`

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"

# GitHub OAuth App
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` value.

### 4. Setup OAuth Apps

#### GitHub OAuth App
1. Visit: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `Entropy Community Forum`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID** → use as `GITHUB_ID`
6. Click **"Generate a new client secret"**
7. Copy the secret → use as `GITHUB_SECRET`

#### Google OAuth 2.0
1. Visit: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first
4. Select **"Web application"**
5. Add these URIs:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
6. Click **"CREATE"**
7. Copy **Client ID** → use as `GOOGLE_CLIENT_ID`
8. Copy **Client secret** → use as `GOOGLE_CLIENT_SECRET`

### 5. Run Database Migration
```bash
cd apps/app
npx prisma db push
```

### 6. Start Development Server
```bash
npm run dev
```

### 7. Test Authentication
1. Open browser: `http://localhost:3000`
2. Try to visit: `http://localhost:3000/profile`
3. Should redirect to sign-in page
4. Click "Continue with Google" or "Continue with GitHub"
5. Authorize the app
6. Should redirect back to `/profile` with your data!

## 🛠️ Troubleshooting

### Session returns `null`
- ✅ Check `NEXTAUTH_SECRET` is set
- ✅ Restart dev server after adding env vars
- ✅ Clear browser cookies and try again
- ✅ Check browser console for errors

### OAuth error "redirect_uri_mismatch"
- ✅ Verify callback URL matches exactly
- ✅ Should be: `http://localhost:3000/api/auth/callback/{provider}`
- ✅ No trailing slash

### Database error on sign-in
- ✅ Run `npx prisma db push`
- ✅ Check `DATABASE_URL` is correct
- ✅ Verify Postgres is running

### Protected routes not working
- ✅ Check middleware is running (should see logs)
- ✅ Verify `NEXTAUTH_SECRET` in env file
- ✅ Clear cookies and sign in again

## 📝 What's Protected

These routes now require authentication:
- ✅ `/profile` - User profile page
- ✅ `/create-community` - Community creation

To add more protected routes, edit `middleware.ts`:
```typescript
const protectedRoutes = [
  '/create-community',
  '/profile',
  '/your-route-here', // Add here
]
```

## 🔍 Verify Setup

Run these checks:

### 1. Check session endpoint
```bash
curl http://localhost:3000/api/auth/session
```
Should return `{}` if not signed in, or user data if signed in.

### 2. Check environment
Open browser console and run:
```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

### 3. Check middleware
Visit `/profile` without signing in - should redirect to `/auth/signin?callbackUrl=/profile`

## ✅ Success Checklist

- [ ] `.env.local` file created with all variables
- [ ] GitHub OAuth App created and credentials added
- [ ] Google OAuth 2.0 Client created and credentials added
- [ ] `NEXTAUTH_SECRET` generated and added
- [ ] Database migration run (`npx prisma db push`)
- [ ] Dev server restarted
- [ ] Can sign in with GitHub
- [ ] Can sign in with Google
- [ ] Protected routes redirect when not signed in
- [ ] Session persists after page refresh
- [ ] Profile page shows real user data

## 🎉 You're Done!

Your authentication is now fully configured with:
- ✅ GitHub OAuth
- ✅ Google OAuth  
- ✅ Protected routes
- ✅ Session persistence
- ✅ Auto database sync
- ✅ No Firebase dependencies

For more details, see `AUTH_SETUP_SUMMARY.md`
