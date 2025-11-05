import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/me/credits - Get current user's credits
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      select: { credits: true }
    });

    return NextResponse.json({ credits: user?.credits || 0 });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}

// POST /api/users/me/credits - Redeem credits for actions
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, amount } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const cost = amount || 1;

    // First check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.credits < cost) {
      return NextResponse.json({
        error: "Insufficient credits",
        required: cost,
        available: user.credits
      }, { status: 402 });
    }

    // Update user credits
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        credits: { decrement: cost },
        updatedAt: new Date()
      },
      select: { credits: true }
    });

    // Create ledger entry
    await prisma.points_ledger.create({
      data: {
        userId: session.user.id,
        eventType: "CREDITS_REDEEMED",
        points: -cost,
        description: `Redeemed ${cost} credits for ${action}`,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      credits: updatedUser.credits,
      redeemed: cost,
      action
    });

  } catch (error) {
    console.error("Error redeeming credits:", error);
    return NextResponse.json({ error: "Failed to redeem credits" }, { status: 500 });
  }
}