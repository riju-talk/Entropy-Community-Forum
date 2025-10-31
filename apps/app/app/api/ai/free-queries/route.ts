import { NextResponse } from "next/server";

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(";");
  for (const p of parts) {
    const [k, ...v] = p.split("=");
    cookies[k?.trim()] = decodeURIComponent((v || []).join("=") || "");
  }
  return cookies;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = (body.question as string) || "";

    const cookieHeader = (request.headers as any).get("cookie");
    const cookies = parseCookies(cookieHeader);
    let remaining = Number.isFinite(Number(cookies.free_queries)) ? Number(cookies.free_queries) : 3;

    if (isNaN(remaining) || remaining < 0) remaining = 3;

    if (remaining <= 0) {
      return NextResponse.json({ allowed: false, message: "Free queries exhausted. Please sign in." }, { status: 403 });
    }

    // Decrement remaining and set cookie
    remaining = remaining - 1;

    // Simple canned answer logic (placeholder). Replace with AI agent call when authenticated.
    const cannedAnswers = [
      "Here's a concise answer to your question.",
      "This is another helpful suggestion for the query.",
      "Third free answer — please sign in to continue exploring more detailed help.",
    ];

    const answer = cannedAnswers[Math.min(2, Math.max(0, remaining))] || cannedAnswers[0];

    const res = NextResponse.json({ allowed: true, remaining, answer, note: "Unauthenticated free query (limited to 3)." });
    // Set cookie for remaining queries (expires in 7 days)
    const cookie = `free_queries=${remaining}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (err) {
    console.error("Error in free-queries route:", err);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}

export async function GET() {
  // Return informational data about the free queries endpoint
  return NextResponse.json({ allowed: true, limit: 3, description: "POST a JSON body { question: string } to consume a free query. After 3 queries you'll need to sign in." });
}
