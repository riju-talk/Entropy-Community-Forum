import { type NextRequest, NextResponse } from "next/server"
import { getDoubts } from "@/app/actions/doubts"
import type { Subject } from "@prisma/client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const subject = searchParams.get("subject") as Subject | undefined
  const sortBy = searchParams.get("sortBy") || "createdAt"
  const order = (searchParams.get("order") as "asc" | "desc") || "desc"

  try {
    const result = await getDoubts({
      page,
      limit,
      subject: subject || undefined,
      sortBy,
      order,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching doubts:", error)
    return NextResponse.json({ error: "Failed to fetch doubts" }, { status: 500 })
  }
}
