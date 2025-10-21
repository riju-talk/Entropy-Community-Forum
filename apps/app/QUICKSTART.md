# Quick Start Guide - Entropy Platform

Get up and running in 5 minutes!

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org))
- [ ] **Python 3.11+** installed ([Download](https://python.org))
- [ ] **PostgreSQL** or **Supabase account** ([Supabase](https://supabase.com))
- [ ] **OpenAI API Key** ([Get one](https://platform.openai.com/api-keys))
- [ ] **Git** installed

## Step 1: Clone and Setup (2 minutes)

### Windows (Automated)
```powershell
# Clone repository
git clone <your-repo-url>
cd entropy-community-forum

# Run automated setup
.\setup.ps1
```

For Linux/Mac, follow the Manual Setup steps below.

The setup script will:
- ✅ Check prerequisites
- ✅ Create `.env.local` and `spark-ai-agent/.env`
- ✅ Generate secure secrets
- ✅ Install all dependencies
- ✅ Setup database schema

## Step 2: Add API Keys (1 minute)

### Required: OpenAI API Key

Edit both files and add your OpenAI API key:

**File 1: `.env.local`**
```env
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
```

**File 2: `spark-ai-agent/.env`**
```env
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
```

### Optional: OAuth Providers

For Google/GitHub login, add to `.env.local`:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

See [OAuth Setup Guide](#oauth-setup) below.

## Step 3: Start the Application (1 minute)

Open **two terminals**:

### Terminal 1: Next.js Frontend
```bash
npm run dev
```
✅ Frontend running at: http://localhost:5000

### Terminal 2: AI Agent Backend
```bash
cd spark-ai-agent
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
✅ AI Agent running at: http://localhost:8000

## Step 4: Test the Application (1 minute)

### Test Frontend
1. Open http://localhost:5000
2. You should see the Entropy homepage
3. Try browsing doubts/questions

### Test AI Agent
1. Open http://localhost:8000/docs
2. You should see the Swagger API documentation
3. Try the `/health` endpoint

### Test Authentication (if OAuth configured)
1. Click "Sign In" button
2. Choose Google or GitHub
3. Complete OAuth flow
4. You should be logged in

## Common Issues & Quick Fixes

### Issue: "Port already in use"

**Port 5000:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

**Port 8000:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

### Issue: "Database connection failed"

1. Check if PostgreSQL is running
2. Verify `DATABASE_URL` in `.env.local`
3. Try: `npx prisma db push`

### Issue: "Prisma Client not generated"

```bash
npx prisma generate
```

### Issue: "Python packages not found"

```bash
cd spark-ai-agent
pip install -r requirements.txt
```

### Issue: "OpenAI API error"

1. Verify API key is correct in both `.env` files
2. Check API key has credits: https://platform.openai.com/usage
3. Ensure no extra spaces in the key

---

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google+ API"
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:5000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:5000`
4. Set Callback URL: `http://localhost:5000/api/auth/callback/github`
5. Copy Client ID and Secret to `.env.local`

---

## Using Supabase (Recommended for Beginners)

If you don't have PostgreSQL installed locally:

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free tier available)

2. **Create New Project**
   - Click "New Project"
   - Choose a name and password
   - Wait for database to initialize (~2 minutes)

3. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (URI mode)
   - Replace `[YOUR-PASSWORD]` with your password

4. **Update .env.local**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

5. **Push Database Schema**
   ```bash
   npx prisma db push
   ```

---

## Testing Checklist

After setup, verify everything works:

### Frontend Tests
- [ ] Homepage loads at http://localhost:5000
- [ ] Can view doubts/questions
- [ ] Can sign in (if OAuth configured)
- [ ] Navigation works
- [ ] Dark/light mode toggle works

### AI Agent Tests
- [ ] API docs load at http://localhost:8000/docs
- [ ] Health check returns "healthy"
- [ ] Can test chat endpoint in Swagger UI

### Database Tests
- [ ] Run: `npx prisma studio`
- [ ] Prisma Studio opens at http://localhost:5555
- [ ] Can view database tables

---

## Next Steps

### 1. Create Your First User
- Sign in with Google/GitHub
- Or create account manually in Prisma Studio

### 2. Post a Doubt
- Go to "Ask" page
- Create your first question
- Test voting and commenting

### 3. Try AI Features
- Go to "AI Agent" page
- Upload a document
- Chat with the AI
- Generate flashcards or quiz

### 4. Explore Features
- Check leaderboard
- View your profile
- Browse different subjects
- Test search functionality

---

## Development Tips

### Hot Reload
Both servers support hot reload:
- Next.js: Changes auto-refresh
- AI Agent: Changes auto-restart with `--reload`

### Database Changes
After modifying `prisma/schema.prisma`:
```bash
npx prisma generate
npx prisma db push
```

### View Logs
```bash
# Next.js logs are in terminal
# AI Agent logs are in terminal

# For production, check:
# - Docker: docker-compose logs -f
# - PM2: pm2 logs
```

### Reset Database
```bash
npx prisma migrate reset
# WARNING: This deletes all data!
```

---

## Getting Help

- **Documentation**: See `/docs` folder
- **Deployment**: See `DEPLOYMENT.md`
- **Tech Stack**: See `docs/TECH_STACK.md`
- **Issues**: Create GitHub issue
- **Community**: Join Discord (if available)

---

## Production Deployment

When ready to deploy:

1. **Quick Deploy with Docker**
   ```bash
   docker-compose up -d
   ```

2. **Deploy to Cloud**
   - See `DEPLOYMENT.md` for:
     - Vercel + Railway
     - VPS deployment
     - Docker on cloud

---

**Congratulations! 🎉**

You now have a fully functional Entropy platform running locally!

Start building, learning, and contributing to the community.
