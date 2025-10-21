import { auth } from "@/lib/auth"
import { getUserCredits } from "@/app/actions/credits"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const credits = await getUserCredits()
    return NextResponse.json(credits)
  } catch (error) {
    console.error("Error fetching user credits:", error)
    return NextResponse.json({ error: "Failed to fetch user credits" }, { status: 500 })
  }
}
