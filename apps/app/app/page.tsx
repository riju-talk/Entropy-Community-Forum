export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { DoubtsFeed } from "@/components/doubts-feed"
import { getDoubts } from "@/app/actions/doubts"
import { PrismaClient } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, ArrowRight } from "lucide-react"
import Link from "next/link"

// Local Prisma singleton (no external prisma.ts)
let __prisma__: PrismaClient | undefined
function getPrisma() {
  if (!__prisma__) {
    __prisma__ = new PrismaClient({ log: ["error", "warn"] })
  }
  return __prisma__
}

async function getRecentCommunities() {
  try {
    const prisma = getPrisma()
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        subject: true,
        createdAt: true,
      },
    })

    // Fetch counts separately for each community
    const communitiesWithCounts = await Promise.all(
      communities.map(async (c) => {
        const [memberCount, postCount] = await Promise.all([
          prisma.communityMember.count({ where: { communityId: c.id } }),
          prisma.communityDoubt.count({ where: { communityId: c.id } }),
        ])
        return {
          ...c,
          _count: {
            members: memberCount,
            communityDoubts: postCount,
          },
        }
      })
    )

    return { communities: communitiesWithCounts }
  } catch (error) {
    console.error("[HomePage] Error fetching communities:", error)
    return { communities: [] }
  }
}

async function safeGetDoubts() {
  if (process.env.SKIP_DB === "true") {
    return { doubts: [], total: 0, totalPages: 0, hasMore: false }
  }
  try {
    // load first page with 7 items for initial feed
    return await getDoubts({ page: 1, limit: 7 })
  } catch (e) {
    console.error("safeGetDoubts error:", e)
    return { doubts: [], total: 0, totalPages: 0, hasMore: false }
  }
}

async function safeGetRecentCommunities() {
  if (process.env.SKIP_DB === "true") {
    return { communities: [] }
  }
  return await getRecentCommunities()
}

export default async function HomePage() {
  const { doubts, total, totalPages, hasMore } = await safeGetDoubts()
  const { communities } = await safeGetRecentCommunities()

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Section */}
      {/* Hero Section */}
      <div className="relative mb-12 py-10">
        <div className="absolute top-0 right-0 -z-10 opacity-60 pointer-events-none hidden dark:block">
          <div className="w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 opacity-40 pointer-events-none hidden dark:block">
          <div className="w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="space-y-6 max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9]">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x contrast-125">
              Entropy.
            </span>
            <br />
            <span className="text-foreground text-5xl md:text-7xl tracking-normal font-semibold">Learn without limits.</span>
          </h1>

          <p className="text-xl text-muted-foreground/80 font-medium leading-relaxed max-w-lg">
            The distinct urban space for academic discourse. Join {total}+ students and experts pushing the boundaries of knowledge.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="lg" className="h-14 rounded-2xl px-8 text-lg font-bold shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0" asChild>
              <Link href="/ask">Ask a Question</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-2xl px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 hover:text-cyan-400 transition-all font-semibold" asChild>
              <Link href="/communities">Explore Hubs</Link>
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-mono text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Questions</span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-mono text-foreground">
                {Array.isArray(doubts)
                  ? doubts.reduce((acc, d) => acc + (d._count?.answers || 0), 0)
                  : 0}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Answers</span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold font-mono text-green-500">Active</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Community</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">All Questions</h2>
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
            <DoubtsFeed
              initialDoubts={doubts}
              currentPage={1}
              totalPages={totalPages}
              hasMore={hasMore}
            />
          </div>
        </div>

        {/* Sidebar - New Communities */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                New Communities
              </CardTitle>
              <CardDescription>
                Recently created communities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {communities && communities.length > 0 ? (
                <>
                  {communities.map((community: any) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.id}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {community.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {community.name}
                          </h3>
                          {community.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {community.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{community._count?.members || 0} members</span>
                            <span>•</span>
                            <span>{community._count?.communityDoubts || 0} posts</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/communities">
                      View All Communities
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">
                    No communities yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Found: {communities?.length || 0})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
