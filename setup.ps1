# Entropy Platform Setup Script (PowerShell)
# This script helps you set up the development environment on Windows

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Entropy Platform Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org"
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "Error: Python 3 is not installed" -ForegroundColor Red
    Write-Host "Please install Python 3.11+ from https://python.org"
    exit 1
}

# Database Setup
Write-Host ""
Write-Host "Database Setup" -ForegroundColor Yellow
Write-Host "--------------"
$hasPostgres = Read-Host "Do you have PostgreSQL installed locally? (y/n)"

if ($hasPostgres -eq "y") {
    $dbName = Read-Host "Enter database name [entropy_db]"
    if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "entropy_db" }
    
    $dbUser = Read-Host "Enter database user [entropy]"
    if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "entropy" }
    
    $dbPassword = Read-Host "Enter database password" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
    )
    
    $DATABASE_URL = "postgresql://${dbUser}:${dbPasswordPlain}@localhost:5432/${dbName}?schema=public"
} else {
    Write-Host "You can use Supabase (https://supabase.com) for a free PostgreSQL database"
    $DATABASE_URL = Read-Host "Enter your DATABASE_URL"
}

# Generate secrets
Write-Host ""
Write-Host "Generating secrets..." -ForegroundColor Yellow

function Get-RandomString {
    param([int]$length = 32)
    $bytes = New-Object byte[] $length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

$NEXTAUTH_SECRET = Get-RandomString
$AI_BACKEND_TOKEN = Get-RandomString -length 24

# Create .env.local for Next.js
Write-Host ""
Write-Host "Creating .env.local..." -ForegroundColor Yellow

$envContent = @"
# ==================== DATABASE ====================
DATABASE_URL="$DATABASE_URL"

# ==================== NEXTAUTH ====================
NEXTAUTH_URL="http://localhost:5000"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# ==================== OAUTH PROVIDERS ====================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# ==================== FIREBASE (Optional) ====================
FIREBASE_PRIVATE_KEY=""

# ==================== AI AGENT (Spark) ====================
NEXT_PUBLIC_SPARK_API_URL="http://localhost:8000"
NEXT_PUBLIC_AI_BACKEND_TOKEN="$AI_BACKEND_TOKEN"

# ==================== OPENAI ====================
OPENAI_API_KEY=""
"@

Set-Content -Path ".env.local" -Value $envContent
Write-Host "✓ Created .env.local" -ForegroundColor Green

# Create .env for Spark AI Agent
Write-Host ""
Write-Host "Creating spark-ai-agent/.env..." -ForegroundColor Yellow

# Create directories
New-Item -ItemType Directory -Force -Path "spark-ai-agent\data\chroma_db" | Out-Null
New-Item -ItemType Directory -Force -Path "spark-ai-agent\data\uploads" | Out-Null

$sparkEnvContent = @"
# ==================== APPLICATION ====================
APP_NAME="Spark AI Agent"
DEBUG=True
VERSION="1.0.0"

# ==================== API CONFIGURATION ====================
AI_BACKEND_TOKEN="$AI_BACKEND_TOKEN"
AI_BACKEND_URL="http://localhost:5000"

# ==================== LLM CONFIGURATION ====================
OPENAI_API_KEY=""
LLM_MODEL="gpt-3.5-turbo"
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

# ==================== EMBEDDING MODEL ====================
EMBEDDING_MODEL="all-MiniLM-L6-v2"

# ==================== VECTOR STORE ====================
CHROMA_PERSIST_DIR="./data/chroma_db"

# ==================== FILE UPLOAD ====================
UPLOAD_DIR="./data/uploads"
MAX_UPLOAD_SIZE=10485760

# ==================== CORS ====================
ALLOWED_ORIGINS=["http://localhost:5000", "http://localhost:3000"]

# ==================== CREDIT COSTS ====================
CHAT_SHORT_COST=1.0
CHAT_LONG_COST=2.0
FLASHCARD_COST=3.0
QUIZ_COST=4.0
MINDMAP_COST=2.5

# ==================== RATE LIMITING ====================
RATE_LIMIT_PER_MINUTE=30
"@

Set-Content -Path "spark-ai-agent\.env" -Value $sparkEnvContent
Write-Host "✓ Created spark-ai-agent/.env" -ForegroundColor Green

# Install Node.js dependencies
Write-Host ""
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Node.js dependencies installed" -ForegroundColor Green

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies for AI Agent..." -ForegroundColor Yellow
Set-Location spark-ai-agent
python -m pip install -r requirements.txt
Set-Location ..
Write-Host "✓ Python dependencies installed" -ForegroundColor Green

# Generate Prisma Client
Write-Host ""
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✓ Prisma Client generated" -ForegroundColor Green

# Ask if user wants to push database schema
Write-Host ""
$pushSchema = Read-Host "Do you want to push the database schema now? (y/n)"

if ($pushSchema -eq "y") {
    Write-Host "Pushing database schema..." -ForegroundColor Yellow
    npx prisma db push
    Write-Host "✓ Database schema pushed" -ForegroundColor Green
}

# Final instructions
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add your OpenAI API key to both .env files:"
Write-Host "   - .env.local (OPENAI_API_KEY)"
Write-Host "   - spark-ai-agent\.env (OPENAI_API_KEY)"
Write-Host ""
Write-Host "2. (Optional) Add OAuth credentials to .env.local:"
Write-Host "   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
Write-Host "   - GITHUB_ID and GITHUB_SECRET"
Write-Host ""
Write-Host "3. Start the development servers:"
Write-Host ""
Write-Host "   Terminal 1 - Next.js:"
Write-Host "   PS> npm run dev"
Write-Host ""
Write-Host "   Terminal 2 - AI Agent:"
Write-Host "   PS> cd spark-ai-agent"
Write-Host "   PS> python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Write-Host ""
Write-Host "4. Access the application:"
Write-Host "   - Frontend: http://localhost:5000"
Write-Host "   - AI Agent API: http://localhost:8000/docs"
Write-Host ""
Write-Host "For more information, see DEPLOYMENT.md"
Write-Host ""
