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

export async function acceptAnswer(answerId: string, doubtId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  try {
    // Verify the doubt belongs to the current user
    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      select: { authorId: true },
    })

    if (!doubt || doubt.authorId !== session.user.id) {
      throw new Error("Only the doubt author can accept answers")
    }

    // Get the answer to find the answerer's ID
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { userId: true },
    })

    if (!answer) {
      throw new Error("Answer not found")
    }

    // Mark answer as accepted
    await prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    })

    // Award 2 credits to the answerer for having their answer accepted
    await awardCredits(
      answer.userId,
      "ANSWER_ACCEPTED",
      2,
      `Answer accepted for doubt ${doubtId}`,
      doubtId
    )

    revalidatePath(`/doubts/${doubtId}`)

    return { success: true }
  } catch (error) {
    console.error("Accept answer error:", error)
    throw error
  }
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
