"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { awardCredits } from "./credits"

export async function createAnswer(doubtId: string, content: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const answer = await prisma.answer.create({
    data: {
      content,
      doubtId,
      authorId: session.user.id,
    },
  })

  revalidatePath(`/doubts/${doubtId}`)

  return answer
}

export async function acceptAnswer(answerId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: {
      doubt: {
        select: {
          authorId: true,
          id: true,
          communityId: true,
          title: true,
        },
      },
    },
  })

  if (!answer) {
    throw new Error("Answer not found")
  }

  // Only doubt author can accept answers
  if (answer.doubt.authorId !== session.user.id) {
    throw new Error("Only the doubt author can accept answers")
  }

  // Award 2 credits to answer author for solving the doubt
  await awardCredits(
    answer.authorId,
    "ANSWER_ACCEPTED",
    2,
    `Answer accepted for: ${answer.doubt.title.substring(0, 50)}`,
    answer.doubt.id
  )

  revalidatePath(`/doubts/${answer.doubtId}`)
  if (answer.doubt.communityId) {
    revalidatePath(`/communities/${answer.doubt.communityId}`)
  }

  return { success: true }
}

export async function voteOnAnswer(answerId: string, voteType: "UP" | "DOWN") {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const existingVote = await prisma.answerVote.findUnique({
    where: {
      userId_answerId: {
        userId: session.user.id,
        answerId,
      },
    },
  })

  if (existingVote) {
    if (existingVote.type === voteType) {
      // Remove vote
      await prisma.answerVote.delete({
        where: { id: existingVote.id },
      })
    } else {
      // Change vote
      await prisma.answerVote.update({
        where: { id: existingVote.id },
        data: { type: voteType },
      })
    }
  } else {
    // New vote
    await prisma.answerVote.create({
      data: {
        userId: session.user.id,
        answerId,
        type: voteType,
      },
    })
  }

  // Recalculate answer score
  const votes = await prisma.answerVote.groupBy({
    by: ["type"],
    where: { answerId },
    _count: true,
  })

  const upvotes = votes.find((v) => v.type === "UP")?._count ?? 0
  const downvotes = votes.find((v) => v.type === "DOWN")?._count ?? 0

  const answer = await prisma.answer.update({
    where: { id: answerId },
    data: {
      upvotes,
      downvotes,
    },
    select: {
      doubtId: true,
      doubt: {
        select: {
          communityId: true,
        },
      },
    },
  })

  revalidatePath(`/doubts/${answer.doubtId}`)
  if (answer.doubt.communityId) {
    revalidatePath(`/communities/${answer.doubt.communityId}`)
  }

  return { success: true }
}
