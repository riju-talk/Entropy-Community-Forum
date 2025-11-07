# Entropy AI Agent Backend

AI-powered learning tools using **100% FREE** services:
- **ChatGroq** (Free LLM API with Llama 3)
- **GPT4All** (Free local embeddings)
- **ChromaDB** (Free local vector database)

## Features

1. **Q&A with Document Intelligence** - Upload PDFs, DOCX, TXT for context-aware answers
2. **Mind Mapping** - Generate Mermaid diagrams (flowcharts, mind maps, etc.)
3. **Quiz Generator** - Create multiple-choice quizzes with explanations
4. **Flashcards** - Generate customizable study flashcards

## Setup

### Prerequisites
- Python 3.11+
- Groq API Key (free from https://console.groq.com)
- Node.js 18+ (for Turborepo integration)

### Quick Start (Turborepo)

```bash
# From repo root
npm run setup:agent
npm run dev:agent

# Or run both Next.js app and AI agent
npm run dev
```

### Standalone Setup

```bash
# Navigate to ai-agent directory
cd apps/ai-agent

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add GROQ_API_KEY and AI_BACKEND_TOKEN

# Run setup
python setup.py

# Start server
python -m uvicorn app.main:app --reload --port 8000
```

### Docker

```bash
# From repo root
docker-compose up ai-agent

# Or build and run standalone
cd apps/ai-agent
docker build -t entropy-ai-agent .
docker run -p 8000:8000 --env-file .env entropy-ai-agent
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Q&A (Public - No auth)
```bash
POST /api/qa
Content-Type: multipart/form-data

Fields:
- question: str
- system_prompt: str (optional)
- documents: File[] (optional)
```

### Mind Map (Requires auth)
```bash
POST /api/mindmap
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "topic": "Machine Learning",
  "diagram_type": "mindmap"
}
```

### Quiz (Requires auth)
```bash
POST /api/quiz
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "topic": "Python Basics",
  "num_questions": 5,
  "difficulty": "medium"
}
```

### Flashcards (Requires auth)
```bash
POST /api/flashcards
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "topic": "Biology",
  "focus_topics": "cells,dna,proteins",
  "num_cards": 10
}
```

## Configuration

Edit `.env` file:

```env
# Required
GROQ_API_KEY=your_groq_api_key
AI_BACKEND_TOKEN=shared_secret_with_nextjs

# Optional
LLM_MODEL=llama3-8b-8192
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000
EMBEDDING_MODEL=gpt4all
```

## Troubleshooting

### ChromaDB Issues
```bash
rm -rf data/chroma_db
python setup.py
```

### GPT4All Download
First run downloads model automatically (~2GB). Be patient!

### Groq Rate Limits
Free tier: 30 requests/minute. Upgrade if needed.

### Port Already in Use
```bash
# Change port in .env or start with custom port
PORT=8001 python -m uvicorn app.main:app --reload
```

## Development

```bash
# Install dev dependencies
pip install -r requirements.txt

# Run with auto-reload
npm run dev

# Or directly
python -m uvicorn app.main:app --reload --port 8000
```

## Integration with Next.js

The AI agent is automatically integrated when running `npm run dev` from the repo root.

API calls from Next.js:
```typescript
const response = await fetch('/api/ai-agent/qa', {
  method: 'POST',
  body: formData
})
```

## Tech Stack

- **FastAPI** - Modern Python web framework
- **ChatGroq** - Free LLM API (Llama 3)
- **GPT4All** - Free local embeddings
- **ChromaDB** - Free vector database
- **PyPDF2** - PDF processing
- **python-docx** - Word document processing

## License

MIT
