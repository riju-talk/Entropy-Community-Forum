// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth) return null
  const [scheme, token] = auth.split(" ")
  if (scheme?.toLowerCase() !== "bearer" || !token) return null
  return token
}

export async function GET(req: NextRequest) {
  try {
    const idToken = extractBearerToken(req)
    if (!idToken) return NextResponse.json({ user: null }, { status: 200 })

    const decoded = await adminAuth.verifyIdToken(idToken)
    const email = decoded.email
    if (!email) return NextResponse.json({ user: null }, { status: 200 })

    const user = await prisma.user.findUnique({
      where: { email },
    })

    return NextResponse.json({ user, firebase: { uid: decoded.uid } }, { status: 200 })
  } catch (error) {
    console.error("/api/auth/session error", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
