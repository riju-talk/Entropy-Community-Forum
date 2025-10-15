# 🌟 Spark AI Agent

Intelligent study assistant for Entropy platform.

## 🚀 Quick Start

### 1. Setup (Already Done!)
```
# Virtual environment is activated
# Dependencies are installed
```

### 2. Configure API Keys
Edit `.env` file and add:
```env
OPENAI_API_KEY=sk-your-actual-key
AI_BACKEND_TOKEN=your-secure-token
```

### 3. Run Server
```bash
uvicorn app.main:app --reload --port 8000
```

Visit: http://localhost:8000/docs

## 📚 4 Core Functions

1. **Chat** - `/api/chat` - Conversational AI with RAG
2. **Flashcards** - `/api/flashcards/generate` - Study card generation
3. **Quiz** - `/api/quiz/generate` - Interactive quizzes
4. **Mind Map** - `/api/mindmap/generate` - Concept visualization

## 🧪 Test API

```bash
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
```

## 📁 Project Structure

```
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
```

## 🔗 Integration with Next.js

In your Next.js app (`lib/spark-api.ts`):

```typescript
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
```

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 📊 Monitoring

- Logs: Check console output
- Health: `curl http://localhost:8000/health`
- Metrics: Available at `/api/info`

## 🤝 Support

- Documentation: `/docs` endpoint
- Issues: GitHub issues
- Contact: support@entropy.edu
