import { NextRequest, NextResponse } from "next/server"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log("📤 Sending Q&A request to:", `${AI_AGENT_URL}/api/qa`)
    
    const response = await fetch(`${AI_AGENT_URL}/api/qa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || "Failed to get answer" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Q&A API error:", error)
    return NextResponse.json(
      { 
        error: "AI agent is not available",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 503 }
    )
  }
}

export async function GET() {
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
