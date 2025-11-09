import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkCreditsAndDeduct } from "@/app/actions/credits"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { allowed: false, reason: "unauthenticated" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { operation, cost } = body

    if (!operation || typeof cost !== "number") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // Check if user has enough credits (doesn't deduct yet)
    const result = await checkCreditsAndDeduct(operation)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Credit check error:", error)
    return NextResponse.json(
      { error: "Failed to check credits" },
      { status: 500 }
    )
  }
}
