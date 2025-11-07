import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const PYTHON_BACKEND_URL = process.env.AI_AGENT_BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { topic, numQuestions, difficulty } = await req.json()

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic required" }, { status: 400 })
    }

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        num_questions: numQuestions || 5,
        difficulty: difficulty || "medium",
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json({ questions: data.questions })
  } catch (error) {
    console.error("Quiz API error:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
