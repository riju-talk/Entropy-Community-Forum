import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: { members: true },
        },
      },
    })

    return NextResponse.json(
      communities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        memberCount: c._count.members,
        createdAt: c.createdAt,
      }))
    )
  } catch (error) {
    console.error("[API] Error fetching recent communities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
