import { NextRequest, NextResponse } from "next/server"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"

// DEPRECATED: Redirect to QA endpoint
export async function POST(req: NextRequest) {
  console.log("⚠️  Chat endpoint is deprecated, redirecting to Q&A")
  
  try {
    const body = await req.json()
    
    // Redirect to QA endpoint
    const response = await fetch(`${AI_AGENT_URL}/api/qa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: body.message || body.question,
        userId: body.userId || "anonymous",
        system_prompt: body.systemPrompt,
        collection_name: body.collection_name || "default"
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || "Failed to chat" },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Transform QA response to chat response format
    return NextResponse.json({
      response: data.answer,
      sessionId: data.qaId,
      sources: data.sources,
      mode: data.mode
    })
  } catch (error) {
    console.error("❌ Chat API error:", error)
    return NextResponse.json(
      { error: "AI agent is not available" },
      { status: 503 }
    )
  }
}

export async function GET() {
  // Redirect greeting to QA
  try {
    const response = await fetch(`${AI_AGENT_URL}/api/qa/greeting`)
    
    if (!response.ok) {
      throw new Error("Failed to get greeting")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { greeting: "Hi! I'm Spark ⚡ - your AI study buddy!" },
      { status: 200 }
    )
  }
}
