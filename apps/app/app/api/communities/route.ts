import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(request: Request) {
  try {
    // For now, return some default communities
    // In production, this would fetch from Firestore
    const communities = [
      {
        id: "cs-community",
        name: "Computer Science",
        description: "Discussions about programming, algorithms, and software development",
        subject: "COMPUTER_SCIENCE",
        isPublic: true,
        createdAt: new Date().toISOString(),
        memberCount: 0
      },
      {
        id: "math-community",
        name: "Mathematics",
        description: "All things math - from algebra to advanced calculus",
        subject: "MATHEMATICS",
        isPublic: true,
        createdAt: new Date().toISOString(),
        memberCount: 0
      },
      {
        id: "physics-community",
        name: "Physics",
        description: "Physics concepts, experiments, and theoretical discussions",
        subject: "PHYSICS",
        isPublic: true,
        createdAt: new Date().toISOString(),
        memberCount: 0
      }
    ];

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json({ error: "Failed to fetch communities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const { name, description, subject, isPublic } = body;

    if (!name) {
      return NextResponse.json({ error: "Community name is required" }, { status: 400 });
    }

    // Create community in Firestore
    const newCommunity = {
      name,
      description: description || "",
      subject: subject || null,
      isPublic: isPublic !== false,
      createdBy: auth.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminFirestore.collection("communities").add(newCommunity);

    return NextResponse.json({
      id: docRef.id,
      ...newCommunity
    });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 });
  }
}
