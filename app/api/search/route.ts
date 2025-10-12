import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Simple search over doubts by title/content/tags.
// GET /api/search?q=term&limit=10
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() || ""
  const limit = Number(searchParams.get("limit") || 10)

  if (!q) {
    return NextResponse.json({ results: [], total: 0 })
  }

  try {
    const [results, total] = await Promise.all([
      prisma.doubt.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
            { tags: { has: q } }, // requires tags: String[] in Prisma schema (present per docs/DATABASE.md)
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          subject: true,
          votes: true,
          createdAt: true,
          author: {
            select: { id: true, name: true, image: true, role: true },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(Math.max(limit, 1), 25),
      }),
      prisma.doubt.count({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
            { tags: { has: q } },
          ],
        },
      }),
    ])

    return NextResponse.json({ results, total, query: q })
  } catch (err) {
    console.error("Search error:", err)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
