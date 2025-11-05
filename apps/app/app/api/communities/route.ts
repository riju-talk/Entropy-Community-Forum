import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
        isPublic: true,
        createdAt: true,
        createdBy: true,
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    return NextResponse.json(communities);
  } catch (err) {
    console.error("Error fetching communities", err);
    return NextResponse.json({ error: "Failed to fetch communities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { name, description, subject = "OTHER", isPublic = true } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const community = await prisma.community.create({
      data: {
        name,
        description: description ?? null,
        subject,
        isPublic: Boolean(isPublic),
        createdBy: user.id,
      },
    });

    return NextResponse.json({ community }, { status: 201 });
  } catch (err) {
    console.error("Error creating community", err);
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 });
  }
}
