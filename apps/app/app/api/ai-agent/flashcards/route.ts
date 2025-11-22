import { NextRequest, NextResponse } from "next/server"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"

// Helper function for proxying requests
async function proxyRequest(endpoint: string, options: RequestInit) {
  const url = `${AI_AGENT_URL}${endpoint}`
  console.log("[PROXY]", options.method || "GET", url)
  
  const resp = await fetch(url, options)
  const text = await resp.text()
  
  try {
    return {
      body: text ? JSON.parse(text) : null,
      status: resp.status,
      isText: false,
    }
  } catch {
    return {
      body: text,
      status: resp.status,
      isText: true,
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("[API][FLASHCARDS] POST request received");
    
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (!AI_AGENT_URL) {
      return NextResponse.json({ error: "AI_AGENT_URL not configured" }, { status: 500 })
    }

    console.log("[API][FLASHCARDS] Forwarding to backend:", JSON.stringify(body))

    const resp = await proxyRequest("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (resp.isText) {
      return new NextResponse(String(resp.body), { status: resp.status, headers: { "Content-Type": "text/plain" } })
    }
    return NextResponse.json(resp.body, { status: resp.status })
  } catch (err) {
    console.error("[API][FLASHCARDS] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
