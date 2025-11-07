import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const community = await prisma.community.findUnique({
      where: { id: params.communityId },
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
        isPublic: true,
        createdAt: true,
        createdBy: true,
        _count: {
          select: {
            members: true,
            communityDoubts: true
          }
        }
      }
    })

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    return NextResponse.json(community)
  } catch (error) {
    console.error("Error fetching community:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
