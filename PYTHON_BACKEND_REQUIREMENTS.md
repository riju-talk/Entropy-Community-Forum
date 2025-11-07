# Python AI Agent Backend Requirements

## Overview
The Python backend should provide AI-powered learning tools with the following endpoints.

## Base URL
`http://localhost:8000`

## Required Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
SHARED_SECRET=your_shared_secret_key  # For authentication between services
```

## API Endpoints

### 1. Health Check
**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. Q&A with Document Intelligence
**Endpoint:** `POST /api/qa`

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `question`: string (required)
  - `system_prompt`: string (optional)
  - `documents`: File[] (optional, multiple files)

**Supported Document Types:**
- PDF (.pdf)
- Text (.txt)
- Word (.doc, .docx)

**Processing Requirements:**
- Extract text from documents
- Use RAG (Retrieval Augmented Generation) for context-aware answers
- Chunk documents intelligently
- Store embeddings for efficient retrieval

**Response:**
```json
{
  "answer": "string",
  "sources": ["doc1.pdf", "doc2.txt"],
  "confidence": 0.95
}
```

### 3. Mind Mapping / Flowcharting
**Endpoint:** `POST /api/mindmap`

**Request:**
```json
{
  "topic": "string",
  "diagram_type": "mindmap" | "flowchart" | "sequence" | "class" | "gantt"
}
```

**Response:**
```json
{
  "mermaid_code": "graph TD\n  A[Start] --> B[End]",
  "diagram_type": "flowchart"
}
```

**Diagram Types:**
- `mindmap`: Hierarchical mind maps
- `flowchart`: Process flow diagrams
- `sequence`: Sequence diagrams for interactions
- `class`: UML class diagrams
- `gantt`: Project timeline charts

### 4. Quiz Generator
**Endpoint:** `POST /api/quiz`

**Request:**
```json
{
  "topic": "string",
  "num_questions": 5,
  "difficulty": "easy" | "medium" | "hard"
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "What is X?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "B is correct because..."
    }
  ]
}
```

**Requirements:**
- Generate diverse question types
- Ensure exactly one correct answer per question
- Provide detailed explanations
- Scale difficulty appropriately

### 5. Flashcards Generator
**Endpoint:** `POST /api/flashcards`

**Request:**
```json
{
  "topic": "string",
  "focus_topics": "comma,separated,subtopics",
  "num_cards": 10
}
```

**Response:**
```json
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "topic": "Subtopic category"
    }
  ]
}
```

**Requirements:**
- Generate concise, focused flashcards
- Prioritize focus_topics if provided
- Balance coverage across topics
- Use spaced repetition principles

## Technical Requirements

### Framework
- FastAPI (recommended) or Flask
- Async/await support for better performance

### AI/ML Libraries
- OpenAI API for LLM capabilities
- LangChain for RAG and prompt management
- PyPDF2 or pdfplumber for PDF parsing
- python-docx for Word documents
- ChromaDB or FAISS for vector storage

### Document Processing
```python
from langchain.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
```

### Error Handling
All endpoints should return appropriate HTTP status codes:
- 200: Success
- 400: Bad request (invalid input)
- 500: Internal server error
- 503: Service unavailable

### Rate Limiting
Implement rate limiting to prevent abuse:
- 10 requests per minute per IP
- 100 requests per hour per user

### Logging
Log all requests with:
- Timestamp
- Endpoint
- User ID (if available)
- Processing time
- Success/failure status

## Example Python Backend Structure

