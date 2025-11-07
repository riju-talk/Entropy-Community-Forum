import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"

    if (!query.trim()) {
      return NextResponse.json({ doubts: [], communities: [], users: [] })
    }

    const searchTerm = query.trim()

    let doubts: any[] = []
    let communities: any[] = []
    let users: any[] = []

    if (type === "all" || type === "doubts") {
      doubts = await prisma.doubt.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { content: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 10,
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    if (type === "all" || type === "communities") {
      communities = await prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 10,
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    if (type === "all" || type === "users") {
      users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    }

    return NextResponse.json({
      doubts,
      communities,
      users,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
