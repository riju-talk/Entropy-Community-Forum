import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const comments = await db.comment.findMany({
      where: { postId: params.postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { likes: true }
        },
        likes: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { id: true }
            }
          : false
      }
    })

    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        likes: comment._count.likes,
        isLiked: session?.user?.id ? comment.likes.length > 0 : false
      }))
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string; postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await req.json()

    const comment = await db.comment.create({
      data: {
        content,
        postId: params.postId,
        authorId: session.user.id
      }
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
