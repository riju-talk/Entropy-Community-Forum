import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // Replace this URL with your actual backend endpoint
    const BACKEND_URL = process.env.AI_BACKEND_URL || "https://your-ai-backend.com/api/chat"

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_BACKEND_TOKEN}`,
      },
      body: JSON.stringify({
        message,
        history,
        model: "gpt-4",
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      response: data.response || "I'm sorry, I couldn't process your request right now.",
    })
  } catch (error) {
    console.error("AI Agent API Error:", error)

    // Fallback response for demo purposes
    return NextResponse.json({
      response:
        "I'm currently experiencing some technical difficulties. This is a demo response - please connect your AI backend to get real AI responses!",
    })
  }
}
