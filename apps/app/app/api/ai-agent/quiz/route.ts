import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Resolve AI agent URL from multiple possible env names
const AI_AGENT_URL =
  process.env.AI_AGENT_URL ||
  process.env.NEXT_PUBLIC_SPARK_API_URL ||
  process.env.NEXT_PUBLIC_AI_AGENT_URL ||
  "http://localhost:8000"

// Resolve backend secret/token from common env names. Prefer server-only names first.
const AI_BACKEND_SECRET =
  process.env.AI_BACKEND_SECRET ||
  process.env.AI_BACKEND_TOKEN ||
  process.env.NEXT_PUBLIC_AI_BACKEND_TOKEN ||
  ""

// Log resolved values (avoid logging the secret itself in production)
console.log("[AI-AGENT][QUIZ] Using AI_AGENT_URL:", AI_AGENT_URL)
console.log("[AI-AGENT][QUIZ] AI_BACKEND_SECRET configured:", !!AI_BACKEND_SECRET)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log("[AI-AGENT][QUIZ] Using AI_AGENT_URL:", AI_AGENT_URL)
    console.log("[AI-AGENT][QUIZ] AI_BACKEND_SECRET configured:", AI_BACKEND_SECRET)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!AI_AGENT_URL || !AI_BACKEND_SECRET) {
      console.error("[AI-AGENT][QUIZ] Missing AI_AGENT_URL or AI_BACKEND_SECRET")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // LOG: incoming request (Next.js server log)
    console.log("[AI-AGENT][QUIZ] Incoming request body:", JSON.stringify(body))

    const topic = (body.topic || "").toString().trim()
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const count = Math.max(1, Math.min(Number(body.count || 5), 20))
    const difficulty = (body.difficulty || "medium").toString()
    const systemPrompt = typeof body.systemPrompt === "string" ? body.systemPrompt : undefined

    console.log("[AI-AGENT][QUIZ] Forwarding request", { topic, count, difficulty, hasSystemPrompt: !!systemPrompt })

    const resp = await fetch(`${AI_AGENT_URL}/api/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_BACKEND_SECRET}`,
      },
      body: JSON.stringify({
        topic,
        count,
        difficulty,
        systemPrompt,
        userId: (session.user as any).id,
      }),
    })

    const text = await resp.text()

    // LOG: upstream response (Next.js server log)
    console.log("[AI-AGENT][QUIZ] Upstream response status:", resp.status)
    console.log("[AI-AGENT][QUIZ] Upstream response body:", text)

    if (!resp.ok) {
      console.error("[AI-AGENT][QUIZ] Backend error:", resp.status, text)
      return NextResponse.json({ error: "Quiz generation failed", details: text }, { status: 502 })
    }

    try {
      const json = JSON.parse(text)
      const questions = Array.isArray(json.questions) ? json.questions : (json.data?.questions || [])
      const normalized = (questions || []).map((q: any) => {
        let opts = (q.options || q.choices || []).map((o: any) => String(o)).slice(0, 4)
        while (opts.length < 4) opts.push("None of the above")
        return {
          question: String(q.question || q.prompt || "").trim(),
          options: opts,
          correctAnswer: Number(q.correctAnswer ?? q.correct_answer ?? 0),
          explanation: String(q.explanation ?? ""),
        }
      }).filter((q: any) => q.question && Array.isArray(q.options) && q.options.length === 4)

      // LOG: normalized payload being returned to frontend
      console.log("[AI-AGENT][QUIZ] Returning normalized questions count:", normalized.length)

      return NextResponse.json({ questions: normalized, count: normalized.length, raw: json }, { status: resp.status })
    } catch (parseErr) {
      console.error("[AI-AGENT][QUIZ] Failed to parse upstream JSON:", parseErr)
      return new NextResponse(text, { status: resp.status, headers: { "Content-Type": "text/plain" } })
    }
  } catch (err) {
    console.error("[AI-AGENT][QUIZ] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
