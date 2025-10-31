import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const docRef = adminFirestore.collection("doubts").doc(id);

    // Try to fetch the doubt document defensively
    let doubt: any = null;
    try {
      if (typeof docRef.get === "function") {
        const snap = await docRef.get();
        if (snap && typeof snap.data === "function") {
          doubt = { id: snap.id, ...snap.data() };
        }
      } else if (typeof docRef === "object" && docRef.id) {
        // If the mock returns a plain object
        doubt = { id: docRef.id, ...(docRef as any) };
      }
    } catch (err) {
      console.error("Error fetching doubt doc:", err);
      doubt = null;
    }

    if (!doubt) return NextResponse.json({ error: "Doubt not found" }, { status: 404 });

    // Fetch comments/answers for this doubt. Expect a collection 'answers' or 'comments'
    let answers: any[] = [];
    try {
      const answersCol = adminFirestore.collection("answers");
      let q: any = answersCol;
      if (typeof q.where === "function") q = q.where("doubtId", "==", id);
      if (typeof q.orderBy === "function") q = q.orderBy("createdAt", "asc");
      if (typeof q.get === "function") {
        const snap = await q.get();
        const docs = Array.isArray(snap?.docs) ? snap.docs : [];
        answers = docs.map((d: any) => ({ id: d.id, ...(typeof d.data === "function" ? d.data() : d) }));
      } else {
        answers = [];
      }
    } catch (err) {
      console.error("Error fetching answers for doubt:", err);
      answers = [];
    }

    return NextResponse.json({ ...doubt, answers });
  } catch (error) {
    console.error("Error in doubt detail route:", error);
    return NextResponse.json({ error: "Failed to fetch doubt" }, { status: 500 });
  }
}
