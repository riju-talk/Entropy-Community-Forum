import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

let __prisma__: PrismaClient | undefined;
function getPrisma() {
  if (!__prisma__) {
    __prisma__ = new PrismaClient({ log: ["error", "warn"] });
  }
  return __prisma__;
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getPrisma().user.findUnique({
      where: { email: session.user.email },
      select: { 
        credits: true,
        freeQueriesUsed: true 
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      credits: user.credits,
      freeQueriesUsed: user.freeQueriesUsed
    })
  } catch (error) {
    console.error("Error fetching credits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount } = body

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const user = await getPrisma().user.update({
      where: { email: session.user.email },
      data: {
        credits: {
          increment: amount
        }
      },
      select: { credits: true }
    })

    return NextResponse.json({ credits: user.credits })
  } catch (error) {
    console.error("Error updating credits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
