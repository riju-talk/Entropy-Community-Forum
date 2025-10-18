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

export async function POST(req: NextRequest) {
  try {
    const idToken = extractBearerToken(req)
    if (!idToken) {
      return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 })
    }

    // Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken)

    const uid = decoded.uid
    const email = decoded.email || `${uid}@users.noreply.firebaseapp.com`
    const emailVerified = !!decoded.email_verified
    const name = (decoded as any).name || decoded.name || null
    const picture = (decoded as any).picture || decoded.picture || null

    // Upsert user by email (unique)
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: name ?? undefined,
        image: picture ?? undefined,
        emailVerified: emailVerified ? new Date() : undefined,
      },
      update: {
        name: name ?? undefined,
        image: picture ?? undefined,
        emailVerified: emailVerified ? new Date() : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ user, firebase: { uid } }, { status: 200 })
  } catch (error: any) {
    if (error?.code === "auth/argument-error" || error?.code === "auth/invalid-id-token") {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 401 })
    }
    console.error("/api/auth/sync error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
