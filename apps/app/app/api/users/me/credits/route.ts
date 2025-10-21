import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/users/me/credits - Get current user's credits
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    const userRef = adminFirestore.collection("users").doc(auth.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ credits: 0 });
    }

    return NextResponse.json({ credits: userDoc.data()?.credits || 0 });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}

// POST /api/users/me/credits - Redeem credits for actions
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const { action, amount } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const userRef = adminFirestore.collection("users").doc(auth.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentCredits = userDoc.data()?.credits || 0;
    const cost = amount || 1; // Default cost of 1 credit

    if (currentCredits < cost) {
      return NextResponse.json({
        error: "Insufficient credits",
        required: cost,
        available: currentCredits
      }, { status: 402 });
    }

    // Deduct credits and add ledger entry
    await adminFirestore.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        credits: currentCredits - cost,
        updatedAt: new Date(),
      });

      const ledgerRef = adminFirestore.collection("points_ledger").doc();
      transaction.set(ledgerRef, {
        userId: auth.uid,
        eventType: "CREDITS_REDEEMED",
        points: -cost,
        description: `Redeemed ${cost} credits for ${action}`,
        createdAt: new Date(),
      });
    });

    return NextResponse.json({
      credits: currentCredits - cost,
      redeemed: cost,
      action
    });
  } catch (error) {
    console.error("Error redeeming credits:", error);
    return NextResponse.json({ error: "Failed to redeem credits" }, { status: 500 });
  }
}
