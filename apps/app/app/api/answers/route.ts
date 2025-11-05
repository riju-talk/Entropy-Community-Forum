import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the actual user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { doubtId, content } = body

    // Validation
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    if (!doubtId) {
      return NextResponse.json(
        { error: "Doubt ID is required" },
        { status: 400 }
      )
    }

    // Verify doubt exists
    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      select: { id: true }
    })

    if (!doubt) {
      return NextResponse.json(
        { error: "Doubt not found" },
        { status: 404 }
      )
    }

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        content: content.trim(),
        doubtId,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(answer, { status: 201 })
  } catch (error) {
    console.error("Error creating answer:", error)
    return NextResponse.json(
      { 
        error: "Failed to create answer",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
