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

    const posts = await db.post.findMany({
      where: { communityId: params.communityId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { 
            comments: true,
            likes: true 
          }
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
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
        likes: post._count.likes,
        commentCount: post._count.comments,
        isLiked: session?.user?.id ? post.likes.length > 0 : false
      }))
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content } = await req.json()

    const post = await db.post.create({
      data: {
        title,
        content,
        communityId: params.communityId,
        authorId: session.user.id
      }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
