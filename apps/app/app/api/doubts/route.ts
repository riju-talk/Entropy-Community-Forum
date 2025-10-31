import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/apiAuth";
import type { Transaction } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const subject = searchParams.get("subject");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    // Build query in a defensive way because in development adminFirestore may
    // return a lightweight mock (when Firebase isn't configured). Support both
    // real Firestore Query API and the mocked minimal API.
    const col = adminFirestore.collection("doubts");

    // If the collection object supports chaining (where/orderBy/limit/get)
    // we use the native Firestore query API. Otherwise, fall back to a safe
    // default (empty list) to avoid server errors during local development.
    let doubts: any[] = [];

    try {
      // If .where exists, assume full Firestore API
      let q: any = col;
      if (subject && typeof q.where === "function") q = q.where("subject", "==", subject);
      if (typeof q.orderBy === "function") q = q.orderBy(sortBy, order as any);
      if (typeof q.limit === "function") q = q.limit(limit);

      if (typeof q.get === "function") {
        const snapshot = await q.get();
        // Map docs if snapshot has docs (Firestore) otherwise empty
        const docs = Array.isArray(snapshot?.docs) ? snapshot.docs : [];
        doubts = docs.map((doc: any) => ({
          id: doc.id,
          ...(typeof doc.data === "function" ? doc.data() : doc),
          createdAt:
            (doc.data && doc.data().createdAt && typeof doc.data().createdAt.toDate === "function"
              ? doc.data().createdAt.toDate().toISOString()
              : doc.data?.createdAt) || (doc.createdAt && doc.createdAt) || null,
          updatedAt: null,
        }));
      } else {
        // No .get available on this mock; return empty array
        doubts = [];
      }
    } catch (err) {
      console.error("Error querying doubts (fallback):", err);
      doubts = [];
    }

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
    await adminFirestore.runTransaction(async (transaction: Transaction) => {
      const userDoc: any = await transaction.get(userRef);
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
