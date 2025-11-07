"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { PointEventType } from "@prisma/client"

const CREDIT_VALUES = {
  DOUBT_CREATED: 1,      // 1 credit for asking
  ANSWER_ACCEPTED: 2,    // 2 credits for solving
  AI_CHAT_MESSAGE: -5,
} as const

export async function getUserCredits() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { credits: 0, subscriptionTier: "FREE", documentCount: 0 }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      credits: true,
      subscriptionTier: true,
      documentCount: true,
    },
  })

  return user || { credits: 0, subscriptionTier: "FREE", documentCount: 0 }
}

export async function awardCredits(
  userId: string,
  eventType: PointEventType,
  amount: number,
  description?: string,
  doubtId?: string
) {
  try {
    // Create ledger entry
    await prisma.pointsLedger.create({
      data: {
        userId,
        eventType,
        points: amount,
        description,
        doubtId,
      },
    })

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
    })

    return { success: true, amount }
  } catch (error) {
    console.error("Error awarding credits:", error)
    throw new Error("Failed to award credits")
  }
}

export async function checkUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  return user?.credits ?? 0
}

export async function deductCredits(amount: number) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  })

  if (!user || user.credits < amount) {
    throw new Error("Insufficient credits")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      credits: {
        decrement: amount,
      },
    },
  })

  return user.credits - amount
}

export async function addCredits(amount: number) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      credits: {
        increment: amount,
      },
    },
  })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  })

  return user?.credits || 0
}

export async function updateSubscription(tier: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  let creditsToAdd = 0
  if (tier === "STUDENT_PRO") {
    creditsToAdd = 500
  } else if (tier === "PREMIUM") {
    creditsToAdd = 2000
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      subscriptionTier: tier,
      credits: {
        increment: creditsToAdd,
      },
    },
  })

  return { tier, creditsAdded: creditsToAdd }
}

export async function incrementDocumentCount() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { documentCount: true, subscriptionTier: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.subscriptionTier === "FREE" && user.documentCount >= 10) {
    throw new Error("Document limit reached for free tier")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      documentCount: {
        increment: 1,
      },
    },
  })

  return user.documentCount + 1
}

export async function decrementDocumentCount() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { documentCount: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.documentCount > 0) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        documentCount: {
          decrement: 1,
        },
      },
    })
  }

  return Math.max(0, user.documentCount - 1)
}

export async function checkCreditsAndDeduct(operation: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Authentication required")
  }

  const costMap: Record<string, number> = {
    mindmap: 5,
    flowchart: 5,
    quiz: 3,
    flashcard: 3,
    chat: 1,
  }

  const cost = costMap[operation] || 1

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true, subscriptionTier: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Free users: check credits
  // Paid users: unlimited
  if (user.subscriptionTier === "FREE" && user.credits < cost) {
    return { allowed: false, credits: user.credits, cost, needsUpgrade: true }
  }

  if (user.subscriptionTier === "FREE") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          decrement: cost,
        },
      },
    })
  }

  return { 
    allowed: true, 
    credits: user.subscriptionTier === "FREE" ? user.credits - cost : -1, 
    cost,
    needsUpgrade: false 
  }
}

export async function getCreditHistory(userId: string, limit = 20) {
  return await prisma.pointsLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}
