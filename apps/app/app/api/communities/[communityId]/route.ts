import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const communityId = params.communityId

    const community = await db.community.findUnique({
      where: { id: communityId },
      include: {
        _count: {
          select: { members: true }
        },
        members: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { id: true }
            }
          : false
      }
    })

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: community.id,
      name: community.name,
      description: community.description,
      memberCount: community._count.members,
      isMember: session?.user?.id ? community.members.length > 0 : false
    })
  } catch (error) {
    console.error("Error fetching community:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
