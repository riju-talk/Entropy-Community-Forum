import { type NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { initializeApp } from "firebase-admin/app"
import { credential } from "firebase-admin"

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_PRIVATE_KEY || "", "base64").toString("utf-8"))

const firebaseAdminApp = initializeApp({
  credential: credential.cert(serviceAccount),
})

export async function POST(req: NextRequest) {
  try {
    const { fbIdToken } = await req.json()

    if (!fbIdToken) {
      return NextResponse.json({ message: "Firebase ID token not provided" }, { status: 400 })
    }

    try {
      const decodedToken = await getAuth(firebaseAdminApp).verifyIdToken(fbIdToken)
      const user = {
        id: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        image: decodedToken.picture,
      }
      return NextResponse.json(user)
    } catch (adminError: any) {
      console.error("Firebase Admin verification error:", adminError)
      return NextResponse.json({ message: "Invalid Firebase ID token", error: adminError.message }, { status: 401 })
    }
  } catch (e: any) {
    console.error("Route error:", e)
    return NextResponse.json({ message: "Internal server error", error: e.message }, { status: 500 })
  }
}
