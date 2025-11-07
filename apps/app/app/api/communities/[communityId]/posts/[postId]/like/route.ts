import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingLike = await db.like.findFirst({
      where: {
        postId: params.postId,
        userId: session.user.id
      }
    })

    if (existingLike) {
      await db.like.delete({ where: { id: existingLike.id } })
      return NextResponse.json({ liked: false })
    } else {
      await db.like.create({
        data: {
          postId: params.postId,
          userId: session.user.id
        }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
