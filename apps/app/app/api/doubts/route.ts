import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/apiAuth";
import { Query, CollectionReference } from "firebase-admin/firestore";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const subject = searchParams.get("subject");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    // Build query
    let query: Query | CollectionReference = adminFirestore.collection("doubts");

    if (subject) {
      query = (query as Query).where("subject", "==", subject);
    }

    query = (query as Query).orderBy(sortBy, order).limit(limit);

    const snapshot = await query.get();
    const doubts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    }));

    return NextResponse.json(doubts);
  } catch (error) {
    console.error("Error fetching doubts:", error);
    return NextResponse.json({ error: "Failed to fetch doubts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const { title, content, subject, anonymous, tags, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newDoubt = {
      title,
      content,
      subject: subject || "OTHER",
      tags: tags || [],
      imageUrl: imageUrl || null,
      isAnonymous: anonymous || false,
      isResolved: false,
      authorUid: anonymous ? null : auth.uid,
      authorName: anonymous ? "Anonymous" : auth.name || auth.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      views: 0,
      answersCount: 0,
    };

    const docRef = await adminFirestore.collection("doubts").add(newDoubt);

    // Award +1 credit for creating a doubt
    const userRef = adminFirestore.collection("users").doc(auth.uid);
    await adminFirestore.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentCredits = userDoc.exists ? (userDoc.data()?.credits || 0) : 0;
      transaction.set(userRef, {
        credits: currentCredits + 1,
        uid: auth.uid,
        email: auth.email,
        name: auth.name,
        updatedAt: new Date(),
      }, { merge: true });

      // Add points ledger entry
      const ledgerRef = adminFirestore.collection("points_ledger").doc();
      transaction.set(ledgerRef, {
        userId: auth.uid,
        eventType: "DOUBT_CREATED",
        points: 1,
        description: `Created doubt: ${title}`,
        doubtId: docRef.id,
        createdAt: new Date(),
      });
    });

    return NextResponse.json({
      id: docRef.id,
      ...newDoubt,
      createdAt: newDoubt.createdAt.toISOString(),
      updatedAt: newDoubt.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating doubt:", error);
    return NextResponse.json({ error: "Failed to create doubt" }, { status: 500 });
  }
}
