import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PYTHON_BACKEND_URL = process.env.AI_AGENT_BACKEND_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const question = formData.get("question") as string
    const systemPrompt = formData.get("systemPrompt") as string
    const sessionId = formData.get("sessionId") as string | null
    const documents = formData.getAll("documents")

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question required" }, { status: 400 })
    }

    // Get session if authenticated
    const session = await getServerSession(authOptions)
    let userId: string | null = null
    let chatSessionId: string | null = sessionId

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      userId = user?.id || null
    }

    // Create or get session if user is authenticated
    if (userId && !chatSessionId) {
      const chatSession = await prisma.aIChatSession.create({
        data: {
          userId,
          sessionType: "QA",
          systemPrompt: systemPrompt || "You are a helpful AI tutor.",
        },
      })
      chatSessionId = chatSession.id
    }

    // Save user message if session exists
    if (chatSessionId) {
      await prisma.aIChatMessage.create({
        data: {
          sessionId: chatSessionId,
          role: "USER",
          content: question,
        },
      })
    }

    // Forward to Python backend
    const backendFormData = new FormData()
    backendFormData.append("question", question)
    backendFormData.append("system_prompt", systemPrompt || "You are a helpful AI tutor.")
    
    documents.forEach((doc) => {
      if (doc instanceof File) {
        backendFormData.append("documents", doc)
      }
    })

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/qa`, {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`)
    }

    const data = await response.json()

    // Save assistant response if session exists
    if (chatSessionId) {
      await prisma.aIChatMessage.create({
        data: {
          sessionId: chatSessionId,
          role: "ASSISTANT",
          content: data.answer,
        },
      })

      // Update session timestamp
      await prisma.aIChatSession.update({
        where: { id: chatSessionId },
        data: { updatedAt: new Date() },
      })
    }

    return NextResponse.json({ 
      answer: data.answer,
      sessionId: chatSessionId,
    })
  } catch (error) {
    console.error("QA API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process question", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
