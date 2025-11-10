import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"
const AI_BACKEND_SECRET = process.env.AI_BACKEND_SECRET || ""

function authHeader() {
  console.log("AI_BACKEND_SECRET is set:", !!AI_BACKEND_SECRET);
  return AI_BACKEND_SECRET ? { Authorization: `Bearer ${AI_BACKEND_SECRET}` } : {}
}

async function proxyGet(upstreamPath: string) {
  const upstreamUrl = `${AI_AGENT_URL}${upstreamPath}`
  const resp = await fetch(upstreamUrl, { method: "GET", headers: { ...authHeader() } })
  const text = await resp.text()
  try {
    const json = JSON.parse(text)
    return { status: resp.status, body: json }
  } catch {
    return { status: resp.status, body: text, isText: true }
  }
}

// Handle GET: support ?action=greeting|health|history and ?user_id=...
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const action = (url.searchParams.get("action") || url.searchParams.get("type") || "").toLowerCase()
    const userId = url.searchParams.get("user_id") || url.searchParams.get("userId") || ""

    // Determine upstream path
    let upstreamPath = "/api/qa/greeting"
    if (action === "health") upstreamPath = "/api/qa/health"
    else if (action === "greeting") upstreamPath = "/api/qa/greeting"
    else if (action === "history" && userId) upstreamPath = `/api/qa/history/${encodeURIComponent(userId)}`
    // fallback: if user_id present with no action, treat as history
    else if (!action && userId) upstreamPath = `/api/qa/history/${encodeURIComponent(userId)}`

    // If AI_AGENT_URL not set, return informative error
    if (!AI_AGENT_URL) {
      return NextResponse.json({ error: "AI_AGENT_URL not configured" }, { status: 500 })
    }

    const res = await proxyGet(upstreamPath)
    if (res.isText) {
      return new NextResponse(String(res.body), { status: res.status, headers: { "Content-Type": "text/plain" } })
    }
    return NextResponse.json(res.body, { status: res.status })
  } catch (err) {
    console.error("[AI-AGENT][QA][GET] Proxy error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST remains a proxy for QA requests (JSON or multipart)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!AI_AGENT_URL) {
      return NextResponse.json({ error: "AI_AGENT_URL not configured" }, { status: 500 })
    }

    const contentType = req.headers.get("content-type") || ""
    const isMultipart = contentType.startsWith("multipart/form-data")

    if (isMultipart) {
      const formData = await req.formData()
      if (!formData.get("userId")) formData.append("userId", (session.user as any).id)
      
      // If conversation_history is provided as a form field (JSON string), forward it
      const historyField = formData.get("conversation_history")
      if (historyField && typeof historyField === "string") {
        // Already a string, backend will parse it
      }

      const resp = await fetch(`${AI_AGENT_URL}/api/qa`, {
        method: "POST",
        headers: { ...authHeader() },
        body: formData,
      })

      const text = await resp.text()
      try {
        const json = JSON.parse(text)
        return NextResponse.json(json, { status: resp.status })
      } catch {
        return new NextResponse(text, { status: resp.status, headers: { "Content-Type": "text/plain" } })
      }
    }

    const body = await req.json().catch(() => ({} as any))
    const question = (body?.question || body?.prompt || "").toString().trim()
    if (!question) {
      return NextResponse.json({ error: "Question/prompt is required" }, { status: 400 })
    }

    // Accept conversation_history array (format: [{role: "user"|"assistant", content: string}, ...])
    const conversationHistory = Array.isArray(body?.conversation_history) ? body.conversation_history : undefined

    const payload: any = {
      question,
      system_prompt: body?.systemPrompt ?? body?.system_prompt ?? undefined,
      sessionId: body?.sessionId ?? undefined,
      userId: (session.user as any).id,
      conversation_history: conversationHistory,  // Forward history to backend
      temperature: typeof body?.temperature === "number" ? body.temperature : undefined,
      max_tokens: typeof body?.max_tokens === "number" ? body.max_tokens : undefined,
    }
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const resp = await fetch(`${AI_AGENT_URL}/api/qa`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(payload),
    })

    const result = await resp.json().catch(async () => {
      const txt = await resp.text()
      return { raw: txt }
    })

    return NextResponse.json(result, { status: resp.status })
  } catch (err) {
    console.error("[AI-AGENT][QA] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
