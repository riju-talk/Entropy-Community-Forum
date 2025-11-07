import { NextResponse } from "next/server"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"

export async function GET() {
  console.log("=== AI AGENT HEALTH CHECK ===")
  console.log("AI_AGENT_URL:", AI_AGENT_URL)
  console.log("Attempting to connect to:", `${AI_AGENT_URL}/health`)
  
  try {
    const response = await fetch(`${AI_AGENT_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    console.log("Response status:", response.status)
    console.log("Response ok:", response.ok)

    if (!response.ok) {
      console.error("AI agent responded with error status:", response.status)
      return NextResponse.json(
        { status: "unavailable", error: "AI agent not responding" },
        { status: 503 }
      )
    }

    const data = await response.json()
    console.log("AI agent health response:", JSON.stringify(data, null, 2))
    
    return NextResponse.json({
      status: "available",
      groq_configured: data.groq_configured,
      backend_data: data
    })
  } catch (error) {
    console.error("=== AI AGENT HEALTH CHECK FAILED ===")
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Full error:", error)
    
    return NextResponse.json(
      { 
        status: "unavailable", 
        error: error instanceof Error ? error.message : "Connection failed",
        ai_agent_url: AI_AGENT_URL
      },
      { status: 503 }
    )
  }
}
