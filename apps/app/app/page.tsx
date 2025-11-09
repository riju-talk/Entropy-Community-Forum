import React from "react"
import { DoubtsFeed } from "@/components/doubts-feed"
import { prisma } from "@/lib/prisma"
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

// Assume these server-side helpers exist; previously they threw during build when DB failed
import { getCommunities } from "@/app/actions/communities"
import { getDoubts } from "@/app/actions/doubts"

export default async function HomePage() {
  // Wrap DB calls to avoid build-time crash if Prisma/DB not available
  let communities = []
  let doubts = []
  try {
    communities = await getCommunities?.() ?? []
  } catch (err) {
    // Log and continue with empty fallback so static generation completes
    // Use console.error so Netlify build logs capture the error
    console.error("[HomePage] Error fetching communities:", err)
    communities = []
  }

  try {
    doubts = await getDoubts?.({ limit: 10 }) ?? []
  } catch (err) {
    console.error("[HomePage] Error fetching doubts:", err)
    doubts = []
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Top Questions</h1>
        <p className="text-sm text-muted-foreground">
          The most active questions from the community
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm mb-6">
        <div>
          <span className="font-semibold">{doubts.length}</span>
          <span className="text-muted-foreground ml-1">questions</span>
        </div>
        <div>
          <span className="font-semibold">
            {doubts.reduce((acc, d) => acc + (d._count?.answers || 0), 0)}
          </span>
          <span className="text-muted-foreground ml-1">answers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">All Questions</h2>
          <DoubtsFeed
            initialDoubts={doubts}
            currentPage={1}
            totalPages={1}
            hasMore={false}
          />
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
