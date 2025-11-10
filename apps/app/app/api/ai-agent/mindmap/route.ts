import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const AI_AGENT_URL =
  process.env.AI_AGENT_URL ||
  process.env.NEXT_PUBLIC_SPARK_API_URL ||
  process.env.NEXT_PUBLIC_AI_AGENT_URL ||
  "http://localhost:8000"

const AI_BACKEND_SECRET =
  process.env.AI_BACKEND_SECRET ||
  process.env.AI_BACKEND_TOKEN ||
  process.env.NEXT_PUBLIC_AI_BACKEND_TOKEN ||
  ""

// Simple helper: fetch with timeout and single retry
async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs = 15000, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...opts, signal: controller.signal })
      clearTimeout(id)
      return res
    } catch (err: any) {
      clearTimeout(id)
      const isLast = attempt === retries
      // If last attempt, rethrow
      if (isLast) throw err
      // otherwise small backoff then retry
      await new Promise((r) => setTimeout(r, 300))
    }
  }
  // unreachable
  throw new Error("Unreachable")
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!AI_AGENT_URL) {
      console.error("[AI-AGENT][MINDMAP] AI_AGENT_URL not configured")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    // Accept JSON body and normalize fields coming from UI
    const body = await req.json().catch(() => ({} as any))

    // Map UI names to backend expected names. Accept depth or detail_level.
    const topic = (body.topic || body.prompt || "").toString().trim()
    const diagram_type = (body.diagram_type || body.diagramType || body.diagram || "mindmap").toString()
    const detail_level = Number(body.detail_level ?? body.depth ?? 3)
    const systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt : body.system_prompt ?? undefined
    const userId = body.userId || (session.user as any)?.id || undefined

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const payload = {
      topic,
      diagram_type,
      detail_level,
      systemPrompt,
      userId,
    }

    // Log incoming normalized payload
    console.log("[AI-AGENT][MINDMAP] Incoming payload:", {
      topic: payload.topic,
      diagram_type: payload.diagram_type,
      detail_level: payload.detail_level,
      hasSystemPrompt: !!payload.systemPrompt,
      userId: !!payload.userId,
    })

    // Build headers (do not require secret here per current design; include if configured)
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (AI_BACKEND_SECRET) headers["Authorization"] = `Bearer ${AI_BACKEND_SECRET}`

    // Call AI agent backend with timeout and one retry
    let resp
    try {
      resp = await fetchWithTimeout(
        `${AI_AGENT_URL}/api/mindmap`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        },
        20000,
        1
      )
    } catch (err: any) {
      console.error("[AI-AGENT][MINDMAP] Error: fetch failed", err)
      // Return a helpful 502 error with cause
      const msg = err?.message || String(err)
      return NextResponse.json(
        {
          error: "Upstream request failed",
          detail: msg,
        },
        { status: 502 }
      )
    }

    const text = await resp.text().catch(() => "")
    // Log upstream response status and short body
    console.log("[AI-AGENT][MINDMAP] Upstream status:", resp.status, "bodyPreview:", text?.slice?.(0, 500))

    if (!resp.ok) {
      // If backend returns JSON error, try to parse
      let parsed: any = text
      try {
        parsed = JSON.parse(text)
      } catch {}
      return NextResponse.json(
        {
          error: "Mindmap backend error",
          status: resp.status,
          backend: parsed,
        },
        { status: 502 }
      )
    }

    // Parse successful response
    let json: any = {}
    try {
      json = JSON.parse(text)
    } catch {
      // backend returned plain text (maybe the mermaid source) -> wrap into mermaid_code
      json = { mermaid_code: text }
    }

    // Ensure returned shape includes mermaid_code and meta fields (diagram_type, detail_level)
    const mermaid_code = json.mermaid_code || json.mermaid || json.code || null
    const returned_diagram_type = json.diagram_type || diagram_type
    const returned_detail_level = Number(json.detail_level ?? detail_level)
    const mermaid_version = json.mermaid_version || json.version || null

    if (!mermaid_code) {
      console.warn("[AI-AGENT][MINDMAP] No mermaid_code in backend response. Returning raw result.")
      return NextResponse.json({ raw: json }, { status: 200 })
    }

    // Return normalized JSON to frontend
    return NextResponse.json({
      mermaid_code,
      diagram_type: returned_diagram_type,
      detail_level: returned_detail_level,
      mermaid_version,
      raw: json,
    })
  } catch (err: any) {
    console.error("[AI-AGENT][MINDMAP] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error", detail: err?.message || String(err) }, { status: 500 })
  }
}
