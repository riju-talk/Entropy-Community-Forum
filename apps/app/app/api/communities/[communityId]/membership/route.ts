import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Check membership status
export async function GET(
  _req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ isMember: false })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ isMember: false })
    }

    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId: params.communityId
        }
      },
      select: {
        role: true
      }
    })

    return NextResponse.json({
      isMember: !!membership,
      role: membership?.role || null
    })
  } catch (error) {
    console.error("Error checking membership:", error)
    return NextResponse.json({ isMember: false })
  }
}

// Join community
export async function POST(
  _req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if community exists
    const community = await prisma.community.findUnique({
      where: { id: params.communityId }
    })

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    // Check if already a member
    const existingMembership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId: params.communityId
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 })
    }

    // Add as member
    await prisma.communityMember.create({
      data: {
        userId: user.id,
        communityId: params.communityId,
        role: "MEMBER"
      }
    })

    return NextResponse.json({ success: true, message: "Joined community" })
  } catch (error) {
    console.error("Error joining community:", error)
    return NextResponse.json({ error: "Failed to join community" }, { status: 500 })
  }
}

// Leave community
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if member exists
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId: params.communityId
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 400 })
    }

    // Prevent creator from leaving
    const community = await prisma.community.findUnique({
      where: { id: params.communityId },
      select: { createdBy: true }
    })

    if (community?.createdBy === user.id) {
      return NextResponse.json({ error: "Community creator cannot leave" }, { status: 400 })
    }

    // Remove membership
    await prisma.communityMember.delete({
      where: {
        userId_communityId: {
          userId: user.id,
          communityId: params.communityId
        }
      }
    })

    return NextResponse.json({ success: true, message: "Left community" })
  } catch (error) {
    console.error("Error leaving community:", error)
    return NextResponse.json({ error: "Failed to leave community" }, { status: 500 })
  }
}
