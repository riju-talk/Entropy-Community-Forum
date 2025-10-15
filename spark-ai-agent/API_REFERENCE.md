# Spark AI Agent - API Reference

Complete API documentation for the Spark AI Agent microservice.

## Base URL

**Development**: `http://localhost:8000`  
**Production**: `https://your-ai-agent-domain.com`

## Authentication

All endpoints (except `/` and `/health`) require Bearer token authentication.

```http
Authorization: Bearer your-ai-backend-token
```

The token must match the `AI_BACKEND_TOKEN` environment variable.

---

## Endpoints

### 1. Root

Get service information.

**Endpoint**: `GET /`

**Authentication**: Not required

**Response**:
```json
{
  "service": "Spark AI Agent",
  "version": "1.0.0",
  "status": "running",
  "functions": [
    "chat",
    "flashcards",
    "quiz",
    "mindmap"
  ]
}
```

---

### 2. Health Check

Check service health status.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": 1704067200.0
}
```

---

### 3. Service Info

Get detailed service capabilities and pricing.

**Endpoint**: `GET /api/info`

**Authentication**: Not required

**Response**:
```json
{
  "service": "Spark AI Agent",
  "version": "1.0.0",
  "functions": [
    {
      "name": "chat",
      "description": "Conversational AI with context",
      "cost": "1.0-2.0 credits"
    },
    {
      "name": "flashcards",
      "description": "Generate study flashcards",
      "cost": "3.0 credits"
    },
    {
      "name": "quiz",
      "description": "Create interactive quizzes",
      "cost": "4.0 credits"
    },
    {
      "name": "mindmap",
      "description": "Generate concept mind maps",
      "cost": "2.5 credits"
    }
  ],
  "supported_file_types": [".pdf", ".txt"],
  "max_upload_size_mb": 10
}
```

---

## Function 1: Conversational AI

Chat with AI using context from uploaded materials.

**Endpoint**: `POST /api/chat`

**Authentication**: Required

**Request Body**:
```json
{
  "user_id": "user123",
  "message": "Explain quantum entanglement",
  "session_id": "session-uuid" // Optional
}
```

**Parameters**:
- `user_id` (string, required): User identifier
- `message` (string, required): User's message
- `session_id` (string, optional): Session ID for conversation continuity

**Response**:
```json
{
  "session_id": "session-uuid",
  "response": "Quantum entanglement is a phenomenon where...",
  "follow_up_questions": [
    "What are the practical applications?",
    "How does it relate to quantum computing?",
    "Can you explain Bell's theorem?"
  ],
  "credits_used": 1.0
}
```

**Credits Cost**:
- Short message (<200 chars): 1.0 credits
- Long message (≥200 chars): 2.0 credits

**Example**:
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "message": "What is photosynthesis?"
  }'
```

---

## Function 2: Flashcard Generation

Generate study flashcards for any topic.

**Endpoint**: `POST /api/flashcards/generate`

**Authentication**: Required

**Request Body**:
```json
{
  "user_id": "user123",
  "topic": "Cell Biology",
  "num_cards": 10,
  "difficulty": "medium"
}
```

**Parameters**:
- `user_id` (string, required): User identifier
- `topic` (string, required): Topic for flashcards
- `num_cards` (integer, optional): Number of cards (default: 10, max: 50)
- `difficulty` (string, optional): "easy", "medium", or "hard" (default: "medium")

**Response**:
```json
{
  "flashcards": [
    {
      "front": "What is mitochondria?",
      "back": "The powerhouse of the cell, responsible for producing ATP through cellular respiration."
    },
    {
      "front": "What is the function of ribosomes?",
      "back": "Ribosomes synthesize proteins by translating mRNA sequences."
    }
  ],
  "credits_used": 3.0,
  "total_generated": 10
}
```

**Credits Cost**: 3.0 credits

**Example**:
```bash
curl -X POST http://localhost:8000/api/flashcards/generate \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "topic": "Python Programming",
    "num_cards": 5,
    "difficulty": "easy"
  }'
```

---

## Function 3: Quiz Generation

Create interactive quizzes with multiple question types.

**Endpoint**: `POST /api/quiz/generate`

**Authentication**: Required

**Request Body**:
```json
{
  "user_id": "user123",
  "topic": "World War II",
  "num_questions": 5,
  "question_types": ["mcq", "true_false"]
}
```

**Parameters**:
- `user_id` (string, required): User identifier
- `topic` (string, required): Quiz topic
- `num_questions` (integer, optional): Number of questions (default: 5, max: 20)
- `question_types` (array, optional): Question types (default: ["mcq", "true_false"])
  - Available types: "mcq", "true_false", "short_answer"

**Response**:
```json
{
  "quiz": [
    {
      "type": "mcq",
      "question": "In which year did World War II begin?",
      "options": ["1937", "1939", "1941", "1945"],
      "correct_answer": "1939",
      "explanation": "World War II began on September 1, 1939, when Germany invaded Poland."
    },
    {
      "type": "true_false",
      "question": "The atomic bomb was dropped on Hiroshima in 1945.",
      "correct_answer": "true",
      "explanation": "The atomic bomb was dropped on Hiroshima on August 6, 1945."
    }
  ],
  "credits_used": 4.0,
  "total_questions": 5
}
```

**Credits Cost**: 4.0 credits

**Example**:
```bash
curl -X POST http://localhost:8000/api/quiz/generate \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "topic": "JavaScript Basics",
    "num_questions": 3,
    "question_types": ["mcq"]
  }'
```

---

## Function 4: Mind Map Generation

Generate visual concept maps in Mermaid format.

**Endpoint**: `POST /api/mindmap/generate`

**Authentication**: Required

**Request Body**:
```json
{
  "user_id": "user123",
  "topic": "Machine Learning",
  "depth": 3,
  "style": "hierarchical"
}
```

**Parameters**:
- `user_id` (string, required): User identifier
- `topic` (string, required): Central topic
- `depth` (integer, optional): Tree depth (default: 3, max: 5)
- `style` (string, optional): "hierarchical", "radial", or "flowchart" (default: "hierarchical")

**Response**:
```json
{
  "mind_map": {
    "topic": "Machine Learning",
    "style": "hierarchical",
    "depth": 3,
    "node_count": 15
  },
  "mermaid_code": "graph TD\n  A[Machine Learning] --> B[Supervised Learning]\n  A --> C[Unsupervised Learning]\n  B --> D[Classification]\n  B --> E[Regression]",
  "credits_used": 2.5
}
```

**Credits Cost**: 2.5 credits

**Mermaid Rendering**: The `mermaid_code` can be rendered using:
- Mermaid.js library
- Mermaid Live Editor: https://mermaid.live
- GitHub Markdown (supports Mermaid)

**Example**:
```bash
curl -X POST http://localhost:8000/api/mindmap/generate \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "topic": "Neural Networks",
    "depth": 2,
    "style": "flowchart"
  }'
```

---

## Document Management

### Upload Document

Upload and process study materials (PDF/TXT).

**Endpoint**: `POST /api/documents/upload`

**Authentication**: Required

**Request**: Multipart form data

**Parameters**:
- `user_id` (query string, required): User identifier
- `file` (file, required): Document file (PDF or TXT)

**Response**:
```json
{
  "message": "Document uploaded and processed successfully",
  "file_id": "doc-uuid",
  "filename": "textbook.pdf",
  "chunks_created": 42,
  "embeddings_generated": 42
}
```

**File Limits**:
- Max size: 10 MB
- Allowed types: .pdf, .txt

**Example**:
```bash
curl -X POST "http://localhost:8000/api/documents/upload?user_id=user123" \
  -H "Authorization: Bearer your-token" \
  -F "file=@/path/to/document.pdf"
```

---

### List Documents

List all uploaded documents for a user.

**Endpoint**: `GET /api/documents/{user_id}`

**Authentication**: Required

**Parameters**:
- `user_id` (path, required): User identifier

**Response**:
```json
{
  "user_id": "user123",
  "documents": [
    {
      "filename": "textbook.pdf",
      "uploaded_at": "2024-01-01T12:00:00Z",
      "size_bytes": 1048576,
      "chunks": 42
    },
    {
      "filename": "notes.txt",
      "uploaded_at": "2024-01-02T10:30:00Z",
      "size_bytes": 51200,
      "chunks": 8
    }
  ],
  "count": 2
}
```

**Example**:
```bash
curl -X GET http://localhost:8000/api/documents/user123 \
  -H "Authorization: Bearer your-token"
```

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid authentication token"
}
```

### 413 Request Entity Too Large
```json
{
  "detail": "File too large. Max size: 10MB"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error occurred"
}
```

---

## Rate Limiting

- **Limit**: 30 requests per minute per user
- **Header**: `X-RateLimit-Remaining`
- **Response** (when exceeded):
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

---

## Interactive API Documentation

Visit the auto-generated Swagger UI for interactive testing:

**URL**: `http://localhost:8000/docs`

Features:
- Try out all endpoints
- View request/response schemas
- Test authentication
- See example requests

---

## Client Libraries

### JavaScript/TypeScript

Use the provided client in `lib/spark-api.ts`:

```typescript
import { sparkAPI } from '@/lib/spark-api'

// Chat
const response = await sparkAPI.chat(userId, "Hello AI!")

// Generate flashcards
const flashcards = await sparkAPI.generateFlashcards(
  userId,
  "Biology",
  10,
  "medium"
)

// Generate quiz
const quiz = await sparkAPI.generateQuiz(
  userId,
  "History",
  5,
  ["mcq", "true_false"]
)

// Generate mind map
const mindmap = await sparkAPI.generateMindMap(
  userId,
  "Physics",
  3,
  "hierarchical"
)

// Upload document
const result = await sparkAPI.uploadDocument(userId, file)
```

### Python

```python
import requests

BASE_URL = "http://localhost:8000"
TOKEN = "your-ai-backend-token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Chat
response = requests.post(
    f"{BASE_URL}/api/chat",
    headers=headers,
    json={
        "user_id": "user123",
        "message": "Explain AI"
    }
)
print(response.json())
```

### cURL

```bash
# Set variables
BASE_URL="http://localhost:8000"
TOKEN="your-ai-backend-token"

# Chat
curl -X POST "$BASE_URL/api/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user123","message":"Hello"}'
```

---

## Environment Variables

Required environment variables for the AI Agent:

```env
# Authentication
AI_BACKEND_TOKEN="your-secure-token"

# OpenAI
OPENAI_API_KEY="sk-your-api-key"
LLM_MODEL="gpt-3.5-turbo"

# Vector Store
CHROMA_PERSIST_DIR="./data/chroma_db"

# File Upload
UPLOAD_DIR="./data/uploads"
MAX_UPLOAD_SIZE=10485760

# CORS
ALLOWED_ORIGINS=["http://localhost:5000"]
```

---

## Best Practices

1. **Authentication**: Always include the Bearer token
2. **Error Handling**: Handle all error responses gracefully
3. **Rate Limiting**: Implement retry logic with exponential backoff
4. **File Uploads**: Validate file size and type before uploading
5. **Session Management**: Reuse session IDs for conversation continuity
6. **Credits**: Check user credits before making requests
7. **Timeouts**: Set appropriate request timeouts (30s recommended)

---

## Support

- **Documentation**: See main README.md
- **Issues**: Report on GitHub
- **API Status**: Check `/health` endpoint

---

**Version**: 1.0.0  
**Last Updated**: 2024
