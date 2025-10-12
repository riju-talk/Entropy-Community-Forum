import { NextResponse } from "next/server"

// NOTE: This route proxies to your AI backend. It does NOT rely on Python here.
// It expects your external AI service to accept { messages } and return { reply, sources? }.
export async function POST(req: Request) {
  try {
    const url = process.env.AI_BACKEND_URL
    const token = process.env.AI_BACKEND_TOKEN

    if (!url || !token) {
      return NextResponse.json(
        { error: "AI backend not configured. Set AI_BACKEND_URL and AI_BACKEND_TOKEN." },
        { status: 500 },
      )
    }

    const body = await req.json().catch(() => ({}))
    const messages = Array.isArray(body?.messages) ? body.messages : []

    const res = await fetch(`${url.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: "AI backend error", details: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      reply: data.reply ?? "",
      sources: data.sources ?? [],
      usage: data.usage ?? null,
    })
  } catch (err) {
    console.error("AI Agent error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
