import { NextRequest, NextResponse } from "next/server"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch(`${AI_AGENT_URL}/api/mindmap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || "Failed to generate mindmap" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Mindmap API error:", error)
    return NextResponse.json(
      { error: "Failed to connect to AI agent" },
      { status: 500 }
    )
  }
}
