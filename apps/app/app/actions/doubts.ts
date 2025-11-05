"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { createDoubtSchema, voteSchema } from "@/lib/validations"

export async function createDoubt(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id && formData.get("isAnonymous") !== "true") {
    throw new Error("Authentication required")
  }

  const data = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    subject: formData.get("subject") as string,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
    isAnonymous: formData.get("isAnonymous") === "true",
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  }

  const validatedData = createDoubtSchema.parse(data)

  const doubt = await prisma.doubt.create({
    data: {
      ...validatedData,
      subject: validatedData.subject as any, // Cast to avoid enum type issues
      authorId: validatedData.isAnonymous ? null : (session as any)?.user?.id,
    },
  })

  revalidatePath("/")
  redirect(`/doubts/${doubt.id}`)
}

export async function getDoubts(params?: {
  subject?: string
  tag?: string
  search?: string
  page?: number
  limit?: number
}) {
  try {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (params?.subject) {
      where.subject = params.subject
    }

    if (params?.tag) {
      where.tags = { has: params.tag }
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { content: { contains: params.search, mode: "insensitive" } },
      ]
    }

    const [doubts, total] = await Promise.all([
      prisma.doubt.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          subject: true,
          tags: true,
          isAnonymous: true,
          createdAt: true,
          upvotes: true,
          downvotes: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              answers: true,
              votes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
      }),
      prisma.doubt.count({ where }),
    ])

    return {
      doubts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page < Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error fetching doubts:", error)
    return {
      doubts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false,
    }
  }
}

export async function getDoubtById(id: string) {
  const doubt = await prisma.doubt.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          _count: {
            select: {
              userVotes: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          comments: true,
          userVotes: true,
        },
      },
    },
  })

  if (doubt) {
    // Increment view count
    await prisma.doubt.update({
      where: { id },
      data: { views: { increment: 1 } },
    })
  }

  return doubt
}

export async function voteOnDoubt(doubtId: string, voteType: "UP" | "DOWN") {
  // Voting on doubts is not supported in current schema
  // Votes are only for answers/comments
  throw new Error("Direct voting on doubts is not supported. Please vote on answers instead.")
}
