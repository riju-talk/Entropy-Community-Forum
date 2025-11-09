import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

let __prisma__: PrismaClient | undefined;
function getPrisma() {
  if (!__prisma__) {
    __prisma__ = new PrismaClient({ log: ["error", "warn"] });
  }
  return __prisma__;
}

// GET - List user's chat sessions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getPrisma().user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const sessionType = searchParams.get("type") as "QA" | "MINDMAP" | "QUIZ" | "FLASHCARDS" | null

    const sessions = await getPrisma().aIChatSession.findMany({
      where: {
        userId: user.id,
        ...(sessionType && { sessionType }),
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
            documents: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

// POST - Create new chat session
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getPrisma().user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { sessionType, systemPrompt } = await req.json()

    const chatSession = await getPrisma().aIChatSession.create({
      data: {
        userId: user.id,
        sessionType: sessionType || "QA",
        systemPrompt: systemPrompt || "You are a helpful AI tutor.",
      },
    })

    return NextResponse.json({ session: chatSession })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
