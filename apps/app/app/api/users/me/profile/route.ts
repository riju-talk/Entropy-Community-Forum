import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Profile API] Session:", session.user.email);
    console.log("[Profile API] Fetching user:", session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        doubts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            _count: {
              select: {
                answers: true,
                votes: true,
              },
            },
          },
        },
        answers: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            doubt: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        communityMemberships: {
          include: {
            community: {
              select: {
                id: true,
                name: true,
                description: true,
                _count: {
                  select: {
                    members: true,
                  },
                },
              },
            },
          },
          take: 5,
        },
        userStats: true,
        _count: {
          select: {
            doubts: true,
            answers: true,
            doubtVotes: true,
            answerVotes: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
