import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const communities = await db.community.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json({
      communities: communities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        memberCount: c._count.members,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
