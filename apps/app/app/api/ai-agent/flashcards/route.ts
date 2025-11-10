import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const AI_AGENT_URL = process.env.AI_AGENT_URL || "http://localhost:8000"
// keep reading secret but do not require or send it
const AI_BACKEND_SECRET =
  process.env.AI_BACKEND_SECRET ||
  process.env.AI_BACKEND_TOKEN ||
  process.env.NEXT_PUBLIC_AI_BACKEND_TOKEN ||
  ""

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!AI_AGENT_URL) {
      console.error("[AI-AGENT][FLASHCARDS] AI_AGENT_URL not configured")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const topic = (body?.topic || "").toString().trim()
    const count = Math.max(1, Math.min(Number(body?.count || 10), 50))
    const customPrompt = typeof body?.customPrompt === "string" ? body.customPrompt : undefined

    console.log("[AI-AGENT][FLASHCARDS] Forwarding request (no auth header)", { topic, count, hasCustomPrompt: !!customPrompt })

    // Forward without Authorization header (public endpoint)
    const flashcardsResp = await fetch(`${AI_AGENT_URL}/api/flashcards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization intentionally omitted
      },
      body: JSON.stringify({
        topic,
        count,
        customPrompt,
        userId: (session.user as any).id,
      }),
    })

    const text = await flashcardsResp.text()
    if (!flashcardsResp.ok) {
      console.error("[AI-AGENT][FLASHCARDS] Backend error:", flashcardsResp.status, text)
      return NextResponse.json({ error: "Flashcards generation failed", details: text }, { status: 502 })
    }

    try {
      const result = JSON.parse(text)
      const flashcards = Array.isArray(result.flashcards) ? result.flashcards : (result.data?.flashcards || [])
      const normalized = (flashcards || []).map((c: any) => ({
        front: String(c.front ?? c.question ?? ""),
        back: String(c.back ?? c.answer ?? ""),
      })).filter((f: any) => f.front && f.back)

      return NextResponse.json({ flashcards: normalized, count: normalized.length, raw: result }, { status: flashcardsResp.status })
    } catch (err) {
      console.error("[AI-AGENT][FLASHCARDS] Failed to parse backend JSON:", err)
      return new NextResponse(text, { status: flashcardsResp.status, headers: { "Content-Type": "text/plain" } })
    }
  } catch (err) {
    console.error("[AI-AGENT][FLASHCARDS] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
