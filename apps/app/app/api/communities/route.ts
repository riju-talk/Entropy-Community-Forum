import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json(
      communities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        memberCount: c._count.members,
        createdAt: c.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, subject, isPublic } = body;

    // Create community and add creator as first member (ADMIN) in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const community = await tx.community.create({
        data: {
          name,
          description: description || "",
          subject: subject || "OTHER",
          isPublic: isPublic !== false,
          createdBy: user.id,
        },
      });

      // Auto-add creator as ADMIN member
      await tx.communityMember.create({
        data: {
          userId: user.id,
          communityId: community.id,
          role: "ADMIN",
        },
      });

      return community;
    });

    return NextResponse.json({ community: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 });
  }
}
