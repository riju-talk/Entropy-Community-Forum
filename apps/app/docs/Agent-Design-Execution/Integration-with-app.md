#!/bin/bash
# integrate-nextjs.sh - Integrate Spark AI with Next.js Entropy Platform

echo "🔗 Spark AI + Next.js Integration Script"
echo "========================================="
echo ""

# Check if we're in Next.js project
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in a Next.js project directory"
    echo "Please run this script from your Next.js project root"
    exit 1
fi

echo "✅ Next.js project detected"
echo ""

# 1. Create lib directory if not exists
echo "📁 Creating lib directory..."
mkdir -p lib
echo "✅ Done"

# 2. Create spark-api.ts client
echo ""
echo "📝 Creating Spark API client (lib/spark-api.ts)..."
cat > lib/spark-api.ts << 'EOF'
// lib/spark-api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_SPARK_API_URL || "http://localhost:8000";
const AI_BACKEND_TOKEN = process.env.NEXT_PUBLIC_AI_BACKEND_TOKEN || "";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  follow_up_questions: string[];
  credits_used: number;
  timestamp: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardResponse {
  flashcards: Flashcard[];
  credits_used: number;
  total_generated: number;
}

export interface QuizQuestion {
  type: "mcq" | "true_false" | "short_answer";
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizResponse {
  quiz: QuizQuestion[];
  credits_used: number;
  total_questions: number;
}

export interface MindMapResponse {
  mind_map: {
    topic: string;
    style: string;
    depth: number;
    node_count: number;
  };
  mermaid_code: string;
  credits_used: number;
}

class SparkAPI {
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = AI_BACKEND_TOKEN;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================== Function 1: Chat ====================
  
  async chat(userId: string, message: string, sessionId?: string): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        message,
        session_id: sessionId,
      }),
    });
  }

  // ==================== Function 2: Flashcards ====================
  
  async generateFlashcards(
    userId: string,
    topic: string,
    numCards: number = 10,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ): Promise<FlashcardResponse> {
    return this.request<FlashcardResponse>("/api/flashcards/generate", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        topic,
        num_cards: numCards,
        difficulty,
      }),
    });
  }

  // ==================== Function 3: Quiz ====================
  
  async generateQuiz(
    userId: string,
    topic: string,
    numQuestions: number = 5,
    questionTypes: string[] = ["mcq", "true_false"]
  ): Promise<QuizResponse> {
    return this.request<QuizResponse>("/api/quiz/generate", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        topic,
        num_questions: numQuestions,
        question_types: questionTypes,
      }),
    });
  }

  // ==================== Function 4: Mind Map ====================
  
  async generateMindMap(
    userId: string,
    topic: string,
    depth: number = 3,
    style: "hierarchical" | "radial" | "flowchart" = "hierarchical"
  ): Promise<MindMapResponse> {
    return this.request<MindMapResponse>("/api/mindmap/generate", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        topic,
        depth,
        style,
      }),
    });
  }

  // ==================== Documents ====================
  
  async uploadDocument(userId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.baseURL}/api/documents/upload?user_id=${userId}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Document upload failed");
    }

    return response.json();
  }

  async listDocuments(userId: string): Promise<{ documents: string[]; count: number }> {
    return this.request<{ documents: string[]; count: number }>(
      `/api/documents/${userId}`
    );
  }

  // ==================== Utility ====================
  
  async getServiceInfo(): Promise<any> {
    return this.request("/api/info");
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request("/health");
  }
}

export const sparkAPI = new SparkAPI();
EOF

echo "✅ Spark API client created"

# 3. Update or create .env.local
echo ""
echo "🔐 Updating .env.local..."
if [ -f ".env.local" ]; then
    echo "" >> .env.local
fi

cat >> .env.local << 'EOF'

# Spark AI Agent Configuration
NEXT_PUBLIC_SPARK_API_URL=http://localhost:8000
NEXT_PUBLIC_AI_BACKEND_TOKEN=your-secure-token-here
EOF

echo "✅ Environment variables added to .env.local"

# 4. Create example usage component
echo ""
echo "📝 Creating example usage component..."
mkdir -p components/examples
cat > components/examples/spark-usage-example.tsx << 'EOF'
"use client"

import { useState } from "react"
import { sparkAPI } from "@/lib/spark-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SparkUsageExample() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChat = async () => {
    setLoading(true)
    try {
      const result = await sparkAPI.chat("demo_user", message)
      setResponse(result.response)
    } catch (error: any) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFlashcards = async () => {
    setLoading(true)
    try {
      const result = await sparkAPI.generateFlashcards(
        "demo_user",
        message,
        10,
        "medium"
      )
      setResponse(`Generated ${result.total_generated} flashcards!`)
    } catch (error: any) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleQuiz = async () => {
    setLoading(true)
    try {
      const result = await sparkAPI.generateQuiz(
        "demo_user",
        message,
        5,
        ["mcq", "true_false"]
      )
      setResponse(`Generated ${result.total_questions} quiz questions!`)
    } catch (error: any) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleMindMap = async () => {
    setLoading(true)
    try {
      const result = await sparkAPI.generateMindMap(
        "demo_user",
        message,
        3,
        "hierarchical"
      )
      setResponse(`Mind map created with ${result.mind_map.node_count} nodes!`)
    } catch (error: any) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spark AI - Quick Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter a topic or question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleChat} disabled={loading}>
            Chat
          </Button>
          <Button onClick={handleFlashcards} disabled={loading}>
            Flashcards
          </Button>
          <Button onClick={handleQuiz} disabled={loading}>
            Quiz
          </Button>
          <Button onClick={handleMindMap} disabled={loading}>
            Mind Map
          </Button>
        </div>

        {response && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
EOF

echo "✅ Example component created"

# 5. Create integration test script
echo ""
echo "📝 Creating integration test script..."
cat > scripts/test-spark-integration.ts << 'EOF'
// scripts/test-spark-integration.ts
// Run with: npx tsx scripts/test-spark-integration.ts

import { sparkAPI } from '../lib/spark-api'

async function testIntegration() {
  console.log('🧪 Testing Spark AI Integration...\n')

  const testUserId = 'test_user_' + Date.now()

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing health check...')
    const health = await sparkAPI.healthCheck()
    console.log('✅ Health:', health.status)
  } catch (error) {
    console.error('❌ Health check failed:', error)
    return
  }

  // Test 2: Service Info
  try {
    console.log('\n2️⃣ Testing service info...')
    const info = await sparkAPI.getServiceInfo()
    console.log('✅ Service:', info.service)
    console.log('✅ Functions:', info.functions.map((f: any) => f.name).join(', '))
  } catch (error) {
    console.error('❌ Service info failed:', error)
  }

  // Test 3: Chat
  try {
    console.log('\n3️⃣ Testing chat...')
    const chatResponse = await sparkAPI.chat(
      testUserId,
      'What is machine learning?'
    )
    console.log('✅ Chat response length:', chatResponse.response.length)
    console.log('✅ Follow-up questions:', chatResponse.follow_up_questions.length)
    console.log('✅ Credits used:', chatResponse.credits_used)
  } catch (error: any) {
    console.error('❌ Chat failed:', error.message)
  }

  // Test 4: Flashcards
  try {
    console.log('\n4️⃣ Testing flashcard generation...')
    const flashcards = await sparkAPI.generateFlashcards(
      testUserId,
      'Python basics',
      5,
      'medium'
    )
    console.log('✅ Flashcards generated:', flashcards.total_generated)
    console.log('✅ Credits used:', flashcards.credits_used)
  } catch (error: any) {
    console.error('❌ Flashcards failed:', error.message)
  }

  // Test 5: Quiz
  try {
    console.log('\n5️⃣ Testing quiz generation...')
    const quiz = await sparkAPI.generateQuiz(
      testUserId,
      'Database normalization',
      3,
      ['mcq', 'true_false']
    )
    console.log('✅ Quiz questions:', quiz.total_questions)
    console.log('✅ Credits used:', quiz.credits_used)
  } catch (error: any) {
    console.error('❌ Quiz failed:', error.message)
  }

  // Test 6: Mind Map
  try {
    console.log('\n6️⃣ Testing mind map generation...')
    const mindmap = await sparkAPI.generateMindMap(
      testUserId,
      'Data structures',
      3,
      'hierarchical'
    )
    console.log('✅ Mind map nodes:', mindmap.mind_map.node_count)
    console.log('✅ Credits used:', mindmap.credits_used)
  } catch (error: any) {
    console.error('❌ Mind map failed:', error.message)
  }

  console.log('\n🎉 Integration tests complete!')
}

testIntegration()
EOF

echo "✅ Test script created"

# 6. Create quick start guide
echo ""
echo "📖 Creating Quick Start Guide..."
cat > SPARK_INTEGRATION.md << 'EOF'
# 🔗 Spark AI Integration Guide

## ✅ Integration Complete!

Your Next.js app is now connected to Spark AI Agent.

## 📋 What Was Added

1. **API Client** (`lib/spark-api.ts`)
   - Complete TypeScript client for all 4 functions
   - Type-safe interfaces
   - Error handling

2. **Environment Variables** (`.env.local`)
   - `NEXT_PUBLIC_SPARK_API_URL`
   - `NEXT_PUBLIC_AI_BACKEND_TOKEN`

3. **Example Component** (`components/examples/spark-usage-example.tsx`)
   - Ready-to-use demonstration

4. **Test Script** (`scripts/test-spark-integration.ts`)
   - Integration testing

## 🚀 Quick Start

### 1. Configure Environment

Edit `.env.local`:
```env
NEXT_PUBLIC_SPARK_API_URL=http://localhost:8000
NEXT_PUBLIC_AI_BACKEND_TOKEN=your-actual-token-here
```

### 2. Start Spark AI Server

In the `spark-ai-agent` directory:
```bash
cd spark-ai-agent
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 3. Use in Your Components

```typescript
import { sparkAPI } from "@/lib/spark-api"

// In your component
const handleChat = async () => {
  const response = await sparkAPI.chat(userId, message)
  console.log(response.response)
}

const handleFlashcards = async () => {
  const flashcards = await sparkAPI.generateFlashcards(
    userId,
    topic,
    10,
    "medium"
  )
  console.log(flashcards.flashcards)
}

const handleQuiz = async () => {
  const quiz = await sparkAPI.generateQuiz(userId, topic, 5)
  console.log(quiz.quiz)
}

const handleMindMap = async () => {
  const mindmap = await sparkAPI.generateMindMap(userId, topic)
  console.log(mindmap.mermaid_code)
}
```

### 4. Test Integration

```bash
# Install tsx if needed
npm install -D tsx

# Run test
npx tsx scripts/test-spark-integration.ts
```

## 📚 Available Functions

### 1. Chat
```typescript
sparkAPI.chat(userId: string, message: string, sessionId?: string)
```

### 2. Flashcards
```typescript
sparkAPI.generateFlashcards(
  userId: string,
  topic: string,
  numCards?: number,
  difficulty?: "easy" | "medium" | "hard"
)
```

### 3. Quiz
```typescript
sparkAPI.generateQuiz(
  userId: string,
  topic: string,
  numQuestions?: number,
  questionTypes?: string[]
)
```

### 4. Mind Map
```typescript
sparkAPI.generateMindMap(
  userId: string,
  topic: string,
  depth?: number,
  style?: "hierarchical" | "radial" | "flowchart"
)
```

### Document Upload
```typescript
sparkAPI.uploadDocument(userId: string, file: File)
sparkAPI.listDocuments(userId: string)
```

## 🔧 Adding to Your Pages

Replace the existing AI agent page with the enhanced version:

```bash
# Copy the enhanced Spark page
cp /path/to/spark_page_enhanced.tsx app/spark/page.tsx
```

Or create a new route:

```bash
mkdir -p app/ai
# Add the Spark page component
```

## 🐛 Troubleshooting

### Connection Refused
- Ensure Spark AI server is running on port 8000
- Check `NEXT_PUBLIC_SPARK_API_URL` in `.env.local`

### 401 Unauthorized
- Verify `NEXT_PUBLIC_AI_BACKEND_TOKEN` matches server token
- Check server `.env` file

### CORS Errors
- Add your Next.js URL to `ALLOWED_ORIGINS` in server config
- Restart both servers

## 📊 Monitoring

- Server logs: Check Spark AI console
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## 🎯 Next Steps

1. ✅ Test all 4 functions
2. ✅ Upload sample documents
3. ✅ Integrate with your credit system
4. ✅ Add to navigation menu
5. ✅ Deploy to production

## 🤝 Support

- Documentation: http://localhost:8000/docs
- GitHub Issues: [Your repo]
- Discord: [Your server]
EOF

echo "✅ Quick Start Guide created"

# Summary
echo ""
echo "=========================================="
echo "🎉 Integration Complete!"
echo "=========================================="
echo ""
echo "📋 Files Created:"
echo "  ✅ lib/spark-api.ts"
echo "  ✅ components/examples/spark-usage-example.tsx"
echo "  ✅ scripts/test-spark-integration.ts"
echo "  ✅ SPARK_INTEGRATION.md"
echo "  ✅ .env.local (updated)"
echo ""
echo "📖 Next Steps:"
echo ""
echo "1. Edit .env.local and add your tokens:"
echo "   - NEXT_PUBLIC_AI_BACKEND_TOKEN"
echo ""
echo "2. Start Spark AI server (in another terminal):"
echo "   cd spark-ai-agent"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "3. Test the integration:"
echo "   npx tsx scripts/test-spark-integration.ts"
echo ""
echo "4. Use in your app:"
echo "   import { sparkAPI } from '@/lib/spark-api'"
echo ""
echo "📚 Read SPARK_INTEGRATION.md for complete guide"
echo ""
echo "=========================================="
echo "Happy coding! 🚀"