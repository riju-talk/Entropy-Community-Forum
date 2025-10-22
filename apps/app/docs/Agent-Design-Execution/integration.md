#!/bin/bash
# setup.sh - Complete Setup Script for Spark AI Agent

set -e

echo "🌟 Spark AI Agent - Complete Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Python version
echo "📌 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}❌ Python 3.11+ required. Found: $python_version${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Python version OK: $python_version${NC}"
fi

# Create project structure
echo ""
echo "📁 Creating project structure..."
mkdir -p spark-ai-agent/{app/{api,services,core,utils,schemas},tests/{test_api,test_services},data/{chroma_db,uploads},scripts,docs}
cd spark-ai-agent

# Create __init__.py files
touch app/__init__.py
touch app/api/__init__.py
touch app/services/__init__.py
touch app/core/__init__.py
touch app/utils/__init__.py
touch app/schemas/__init__.py
touch tests/__init__.py
touch tests/test_api/__init__.py
touch tests/test_services/__init__.py

echo -e "${GREEN}✅ Project structure created${NC}"

# Create virtual environment
echo ""
echo "🐍 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo -e "${GREEN}✅ Virtual environment created${NC}"

# Create requirements.txt
echo ""
echo "📦 Creating requirements.txt..."
cat > requirements.txt << 'EOF'
# FastAPI
fastapi==0.109.2
uvicorn[standard]==0.27.1
pydantic==2.6.1
pydantic-settings==2.1.0
python-multipart==0.0.9

# LangChain
langchain==0.1.6
langchain-openai==0.0.5
openai==1.12.0

# Vector Store
chromadb==0.4.22
sentence-transformers==2.3.1

# Document Processing
pypdf==4.0.1
python-docx==1.1.0

# Embeddings
torch==2.2.0
transformers==4.37.2

# Utilities
python-dotenv==1.0.1
python-jose[cryptography]==3.3.0
httpx==0.26.0
EOF

echo -e "${GREEN}✅ requirements.txt created${NC}"

# Install dependencies
echo ""
echo "📦 Installing dependencies (this may take a few minutes)..."
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create .env file
echo ""
echo "🔐 Creating .env file..."
cat > .env << 'EOF'
# Application
DEBUG=True
APP_NAME=Spark AI Agent

# Authentication
AI_BACKEND_TOKEN=your-secure-token-change-this
AI_BACKEND_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# LLM Configuration
LLM_MODEL=gpt-3.5-turbo
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

# Embedding Model
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Storage
CHROMA_PERSIST_DIR=./data/chroma_db
UPLOAD_DIR=./data/uploads
MAX_UPLOAD_SIZE=10485760

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Credit Costs
CHAT_SHORT_COST=1.0
CHAT_LONG_COST=2.0
FLASHCARD_COST=3.0
QUIZ_COST=4.0
MINDMAP_COST=2.5
EOF

echo -e "${YELLOW}⚠️  Please edit .env and add your OPENAI_API_KEY and AI_BACKEND_TOKEN${NC}"
echo -e "${GREEN}✅ .env file created${NC}"

# Download embedding model
echo ""
echo "🧠 Downloading embedding model (first time only)..."
python3 << 'PYEOF'
from sentence_transformers import SentenceTransformer
print("Downloading all-MiniLM-L6-v2...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Model downloaded successfully")
PYEOF

echo -e "${GREEN}✅ Embedding model ready${NC}"

# Create .gitignore
echo ""
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/

# Environment
.env
.env.local

# Data
data/chroma_db/
data/uploads/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
.coverage
htmlcov/

# OS
.DS_Store
Thumbs.db
EOF

echo -e "${GREEN}✅ .gitignore created${NC}"

# Create pytest.ini
cat > pytest.ini << 'EOF'
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
EOF

# Create README.md with quick start
echo ""
echo "📖 Creating README.md..."
cat > README.md << 'EOF'
# 🌟 Spark AI Agent

Intelligent study assistant for Entropy platform.

## 🚀 Quick Start

### 1. Setup (Already Done!)
\`\`\`bash
# Virtual environment is activated
# Dependencies are installed
\`\`\`

### 2. Configure API Keys
Edit `.env` file and add:
\`\`\`env
OPENAI_API_KEY=sk-your-actual-key
AI_BACKEND_TOKEN=your-secure-token
\`\`\`

### 3. Run Server
\`\`\`bash
uvicorn app.main:app --reload --port 8000
\`\`\`

Visit: http://localhost:8000/docs

## 📚 4 Core Functions

1. **Chat** - `/api/chat` - Conversational AI with RAG
2. **Flashcards** - `/api/flashcards/generate` - Study card generation
3. **Quiz** - `/api/quiz/generate` - Interactive quizzes
4. **Mind Map** - `/api/mindmap/generate` - Concept visualization

## 🧪 Test API

\`\`\`bash
# Health check
curl http://localhost:8000/health

# Service info
curl http://localhost:8000/api/info \
  -H "Authorization: Bearer your-token"

# Chat example
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "message": "Explain neural networks"
  }'
\`\`\`

## 📁 Project Structure

\`\`\`
spark-ai-agent/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Configuration
│   ├── api/
│   │   ├── routes.py        # All API endpoints
│   │   └── auth.py          # Authentication
│   ├── services/
│   │   ├── chat_service.py       # Function 1
│   │   ├── flashcard_service.py  # Function 2
│   │   ├── quiz_service.py       # Function 3
│   │   └── mindmap_service.py    # Function 4
│   ├── core/
│   │   ├── vector_store.py  # ChromaDB
│   │   └── llm.py           # LLM client
│   └── schemas/             # Pydantic models
├── tests/                   # Test suite
├── data/                    # Storage
└── .env                     # Configuration
\`\`\`

## 🔗 Integration with Next.js

In your Next.js app (`lib/spark-api.ts`):

\`\`\`typescript
const API_BASE_URL = "http://localhost:8000";
const AI_TOKEN = process.env.AI_BACKEND_TOKEN;

async function chat(userId: string, message: string) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AI_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_id: userId, message })
  });
  return response.json();
}
\`\`\`

## 🐳 Docker Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

## 📊 Monitoring

- Logs: Check console output
- Health: `curl http://localhost:8000/health`
- Metrics: Available at `/api/info`

## 🤝 Support

- Documentation: `/docs` endpoint
- Issues: GitHub issues
- Contact: support@entropy.edu
EOF

echo -e "${GREEN}✅ README.md created${NC}"

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit .env file and add your API keys:"
echo "   - OPENAI_API_KEY"
echo "   - AI_BACKEND_TOKEN"
echo ""
echo "2. Copy all Python files from the artifacts to:"
echo "   - app/main.py"
echo "   - app/config.py"
echo "   - app/api/*.py"
echo "   - app/services/*.py"
echo "   - app/core/*.py"
echo "   - app/schemas/*.py"
echo "   - app/utils/*.py"
echo ""
echo "3. Start the server:"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "4. Test the API:"
echo "   Visit http://localhost:8000/docs"
echo ""
echo "5. Integrate with Next.js:"
echo "   - Add spark-api.ts to your Next.js lib folder"
echo "   - Add the enhanced Spark page component"
echo ""
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  Don't forget to activate virtual environment:${NC}"
echo "   source venv/bin/activate"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
