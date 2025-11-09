import { NextRequest, NextResponse } from "next/server"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log("📤 Mindmap request:", { topic: body.topic, diagramType: body.diagramType })
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    const res = await fetch(`${AI_AGENT_URL}/api/mindmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    
    clearTimeout(timeout)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error("❌ Backend error:", res.status, errorText)
      return NextResponse.json(
        { error: `Backend returned ${res.status}`, details: errorText },
        { status: res.status }
      )
    }
    
    const data = await res.json()
    console.log("✅ Mindmap generated:", { codeLength: data.mermaidCode?.length || 0 })
    
    return NextResponse.json(data)
    
  } catch (err: any) {
    console.error("❌ Mindmap proxy error:", err.message)
    
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 })
    }
    
    return NextResponse.json(
      { error: "Failed to contact AI agent", details: err.message },
      { status: 503 }
    )
  }
}
