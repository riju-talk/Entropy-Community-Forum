"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { createDoubtSchema, voteSchema } from "@/lib/validations"
import type { Subject, VoteType } from "@prisma/client"

export async function createDoubt(formData: FormData) {
  const session = await getServerSession(authOptions)

  const data = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    subject: formData.get("subject") as Subject,
    tags: JSON.parse((formData.get("tags") as string) || "[]"),
    isAnonymous: formData.get("isAnonymous") === "true",
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  }

  const validatedData = createDoubtSchema.parse(data)

  const doubt = await prisma.doubt.create({
    data: {
      ...validatedData,
      authorId: validatedData.isAnonymous ? null : session?.user?.id,
    },
  })

  revalidatePath("/")
  redirect(`/doubts/${doubt.id}`)
}

export async function getDoubts({
  page = 1,
  limit = 10,
  subject,
  sortBy = "createdAt",
  order = "desc",
}: {
  page?: number
  limit?: number
  subject?: Subject
  sortBy?: string
  order?: "asc" | "desc"
} = {}) {
  const skip = (page - 1) * limit

  const doubts = await prisma.doubt.findMany({
    where: subject ? { subject } : undefined,
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
          comments: true,
          userVotes: true,
        },
      },
    },
    orderBy: {
      [sortBy]: order,
    },
    skip,
    take: limit,
  })

  const total = await prisma.doubt.count({
    where: subject ? { subject } : undefined,
  })

  return {
    doubts,
    total,
    hasMore: skip + limit < total,
    page,
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

export async function voteOnDoubt(doubtId: string, voteType: VoteType) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const validatedData = voteSchema.parse({ type: voteType, doubtId })

  // Check if user already voted
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_doubtId: {
        userId: session.user.id,
        doubtId,
      },
    },
  })

  if (existingVote) {
    if (existingVote.type === voteType) {
      // Remove vote if same type
      await prisma.vote.delete({
        where: { id: existingVote.id },
      })
    } else {
      // Update vote type
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type: voteType },
      })
    }
  } else {
    // Create new vote
    await prisma.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        doubtId,
      },
    })
  }

  // Update doubt vote count
  const voteCount = await prisma.vote.aggregate({
    where: { doubtId },
    _sum: {
      type: true, // This will sum UP (1) and DOWN (-1) values
    },
  })

  await prisma.doubt.update({
    where: { id: doubtId },
    data: { votes: voteCount._sum.type || 0 },
  })

  revalidatePath("/")
  revalidatePath(`/doubts/${doubtId}`)
}
