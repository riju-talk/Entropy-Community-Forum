# Deployment Guide - Entropy Community Forum

This guide covers deploying the Entropy platform with both the Next.js frontend and Spark AI Agent microservice.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Node.js**: 18.x or 20.x
- **Python**: 3.11+ (for AI Agent)
- **PostgreSQL**: 15+ (or Supabase account)
- **Docker** (optional, for containerized deployment)

### API Keys Required
- **OpenAI API Key**: For AI features (get from https://platform.openai.com)
- **Google OAuth** (optional): For Google sign-in
- **GitHub OAuth** (optional): For GitHub sign-in

---

## Environment Setup

### 1. Next.js Application (.env.local)

Create `.env.local` in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/entropy_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:5000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# AI Agent
NEXT_PUBLIC_SPARK_API_URL="http://localhost:8000"
NEXT_PUBLIC_AI_BACKEND_TOKEN="your-secure-token"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"
```

### 2. Spark AI Agent (.env)

Create `.env` in `spark-ai-agent/` directory:

```bash
# API Configuration
AI_BACKEND_TOKEN="your-secure-token"
AI_BACKEND_URL="http://localhost:5000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"
LLM_MODEL="gpt-3.5-turbo"

# Vector Store
CHROMA_PERSIST_DIR="./data/chroma_db"
UPLOAD_DIR="./data/uploads"
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -base64 32
```

---

## Local Development

### 1. Install Dependencies

```bash
# Install Next.js dependencies
npm install

# Install Python dependencies for AI Agent
cd spark-ai-agent
pip install -r requirements.txt
cd ..
```

### 2. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Or run migrations (production)
npx prisma migrate deploy
```

### 3. Start Development Servers

**Terminal 1 - Next.js App:**
```bash
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Spark AI Agent:**
```bash
cd spark-ai-agent
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Runs on http://localhost:8000
```

### 4. Access the Application

- **Frontend**: http://localhost:5000
- **AI Agent API**: http://localhost:8000/docs (Swagger UI)
- **AI Agent Health**: http://localhost:8000/health

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# 1. Create .env file for docker-compose
cp .env.example .env

# 2. Edit .env with your credentials
nano .env

# 3. Start all services
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

### Docker Compose Services

The `docker-compose.yml` includes:
- **postgres**: PostgreSQL 15 database
- **nextjs**: Next.js application (port 5000)
- **spark-ai**: Spark AI Agent (port 8000)

### Individual Docker Builds

**Build Next.js:**
```bash
docker build -t entropy-nextjs .
docker run -p 5000:5000 --env-file .env.local entropy-nextjs
```

**Build Spark AI:**
```bash
cd spark-ai-agent
docker build -t entropy-spark-ai .
docker run -p 8000:8000 --env-file .env entropy-spark-ai
```

---

## Production Deployment

### Option 1: Vercel (Next.js) + Railway (AI Agent)

#### Deploy Next.js to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy

3. **Setup Database**
   - Use Supabase (https://supabase.com) or Neon (https://neon.tech)
   - Copy connection string to `DATABASE_URL`
   - Run migrations: `npx prisma migrate deploy`

#### Deploy AI Agent to Railway

1. **Create Railway Project**
   - Go to https://railway.app
   - Create new project
   - Select "Deploy from GitHub repo"

2. **Configure Service**
   - Set root directory: `spark-ai-agent`
   - Add environment variables
   - Deploy

3. **Update Frontend**
   - Update `NEXT_PUBLIC_SPARK_API_URL` in Vercel to Railway URL

### Option 2: VPS Deployment (DigitalOcean, AWS, etc.)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone repository
git clone <your-repo-url>
cd entropy-community-forum

# 3. Install dependencies
npm install
cd spark-ai-agent && pip install -r requirements.txt && cd ..

# 4. Setup environment
cp .env.example .env
nano .env  # Edit with production values

# 5. Build Next.js
npm run build

# 6. Setup PM2 for process management
npm install -g pm2

# 7. Start Next.js
pm2 start npm --name "entropy-nextjs" -- start

# 8. Start AI Agent
cd spark-ai-agent
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name "spark-ai"

# 9. Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/entropy
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ai/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Option 3: Docker on VPS

```bash
# 1. Install Docker and Docker Compose on server
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Clone and configure
git clone <your-repo-url>
cd entropy-community-forum
cp .env.example .env
nano .env

# 3. Deploy with Docker Compose
docker-compose up -d

# 4. Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Database Setup

### Using Supabase (Recommended for beginners)

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Wait for database to initialize

2. **Get Connection String**
   - Go to Settings > Database
   - Copy "Connection string" (URI mode)
   - Replace `[YOUR-PASSWORD]` with your password

3. **Run Migrations**
   ```bash
   DATABASE_URL="your-supabase-url" npx prisma migrate deploy
   ```

### Using Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE entropy_db;
CREATE USER entropy WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE entropy_db TO entropy;
\q

# Run migrations
npx prisma migrate deploy
```

---

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to `.env.local`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Homepage URL: `http://localhost:5000` or `https://your-domain.com`
   - Authorization callback URL: `http://localhost:5000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

---

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### AI Agent Not Responding

```bash
# Check if service is running
curl http://localhost:8000/health

# View logs
cd spark-ai-agent
tail -f logs/app.log

# Test OpenAI connection
python -c "import openai; print(openai.api_key)"
```

### Authentication Issues

1. **Check NEXTAUTH_URL**: Must match your domain
2. **Check NEXTAUTH_SECRET**: Must be set and consistent
3. **Check OAuth credentials**: Verify Client ID and Secret
4. **Check redirect URIs**: Must match in OAuth app settings

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000
# or on Windows
netstat -ano | findstr :5000

# Kill process
kill -9 <PID>
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Next.js health
curl http://localhost:5000/api/health

# AI Agent health
curl http://localhost:8000/health
```

### Logs

```bash
# Docker logs
docker-compose logs -f nextjs
docker-compose logs -f spark-ai

# PM2 logs
pm2 logs entropy-nextjs
pm2 logs spark-ai
```

### Backups

```bash
# Backup PostgreSQL database
pg_dump -U entropy entropy_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U entropy entropy_db < backup_20240101.sql
```

---

## Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS/SSL in production
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Secure database with firewall rules
- [ ] Use environment variables, never commit secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Regular security updates: `npm audit fix`
- [ ] Backup database regularly
- [ ] Monitor error logs

---

## Support

For issues and questions:
- GitHub Issues: [Your Repo URL]
- Documentation: `/docs` folder
- Email: support@your-domain.com

---

**Last Updated**: 2024
**Version**: 1.0.0
