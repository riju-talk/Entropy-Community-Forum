// app/api/auth/firebase/route.ts
import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fbIdToken = body?.fbIdToken
    if (!fbIdToken) return NextResponse.json({ message: "Firebase ID token not provided" }, { status: 400 })

    try {
      const decoded = await adminAuth.verifyIdToken(fbIdToken)
      const user = {
        id: decoded.uid,
        name: (decoded as any).name ?? null,
        email: decoded.email ?? null,
        image: (decoded as any).picture ?? null,
      }
      return NextResponse.json({ ok: true, user }, { status: 200 })
    } catch (adminError: any) {
      console.error("Firebase Admin verification error:", adminError)
      return NextResponse.json({ message: "Invalid Firebase ID token", error: adminError?.message }, { status: 401 })
    }
  } catch (e: any) {
    console.error("Route error:", e)
    return NextResponse.json({ message: "Internal server error", error: e?.message }, { status: 500 })
  }
}
