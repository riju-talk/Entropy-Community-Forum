import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doubtId = params.id

    const answers = await prisma.answer.findMany({
      where: { doubtId },
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ answers })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    )
  }
}
