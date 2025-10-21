import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/apiAuth";
import { FieldValue } from "firebase-admin/firestore";

// Enhanced AI agent route that integrates with Firestore
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    const body = await req.json().catch(() => ({}));
    const { doubtId, prompt, messages } = body;

    if (!doubtId && !prompt) {
      return NextResponse.json({ error: "doubtId or prompt is required" }, { status: 400 });
    }

    // If doubtId is provided, fetch the doubt for context
    let doubtContext = "";
    if (doubtId) {
      const doubtRef = adminFirestore.collection("doubts").doc(doubtId);
      const doubtDoc = await doubtRef.get();

      if (!doubtDoc.exists) {
        return NextResponse.json({ error: "Doubt not found" }, { status: 404 });
      }

      const doubt = doubtDoc.data();
      doubtContext = `Question: ${doubt?.title}\nContent: ${doubt?.content}\n\n`;
    }

    // Build messages for AI
    const aiMessages = messages || [];
    if (prompt) {
      aiMessages.push({
        role: "user",
        content: prompt
      });
    } else if (doubtContext) {
      aiMessages.push({
        role: "user",
        content: `${doubtContext}Please provide a helpful answer to this question.`
      });
    }

    // Call external AI service
    const url = process.env.AI_BACKEND_URL;
    const token = process.env.AI_BACKEND_TOKEN;

    if (!url || !token) {
      return NextResponse.json(
        { error: "AI backend not configured. Set AI_BACKEND_URL and AI_BACKEND_TOKEN." },
        { status: 500 },
      );
    }

    const aiResponse = await fetch(`${url.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages: aiMessages }),
    });

    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      return NextResponse.json({ error: "AI backend error", details: text }, { status: aiResponse.status });
    }

    const aiData = await aiResponse.json();
    const answerText = aiData.reply || "I'm sorry, I couldn't generate a response.";

    // Save answer to Firestore if doubtId is provided
    let answerId = null;
    if (doubtId) {
      const answerRef = await adminFirestore.collection("doubts").doc(doubtId).collection("answers").add({
        text: answerText,
        authorUid: "spark-agent",
        authorName: "Athena AI",
        createdAt: new Date(),
        upvotes: 0,
        downvotes: 0,
      });
      answerId = answerRef.id;

      // Update doubt's answers count
      const doubtRef = adminFirestore.collection("doubts").doc(doubtId);
      await doubtRef.update({
        answersCount: FieldValue.increment(1),
        updatedAt: new Date(),
      });

      // Award +2 credits for answering (unless it's the AI agent itself)
      if (auth.uid !== "spark-agent") {
        const userRef = adminFirestore.collection("users").doc(auth.uid);
        await adminFirestore.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          const currentCredits = userDoc.exists ? (userDoc.data()?.credits || 0) : 0;
          transaction.update(userRef, {
            credits: currentCredits + 2,
            updatedAt: new Date(),
          });

          const ledgerRef = adminFirestore.collection("points_ledger").doc();
          transaction.set(ledgerRef, {
            userId: auth.uid,
            eventType: "ANSWER_CREATED",
            points: 2,
            description: `Answered doubt: ${doubtId}`,
            doubtId: doubtId,
            createdAt: new Date(),
          });
        });
      }
    }

    return NextResponse.json({
      reply: answerText,
      sources: aiData.sources || [],
      usage: aiData.usage || null,
      answerId,
      doubtId,
    });
  } catch (err) {
    console.error("AI Agent error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
