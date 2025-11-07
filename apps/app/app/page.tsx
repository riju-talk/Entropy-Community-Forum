import { DoubtsFeed } from "@/components/doubts-feed"
import { getDoubts } from "@/app/actions/doubts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowRight } from "lucide-react"
import Link from "next/link"

async function getCommunities() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/communities`,
      {
        cache: "no-store",
      }
    )
    if (!response.ok) return { communities: [] }
    const data = await response.json()
    return data
  } catch (error) {
    return { communities: [] }
  }
}

export default async function HomePage() {
  const { doubts, total, totalPages, hasMore } = await getDoubts({
    page: 1,
    limit: 15,
  })

  const { communities } = await getCommunities()

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
          <span className="font-semibold">{total}</span>
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
            totalPages={totalPages}
            hasMore={hasMore}
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
                Join communities to connect with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {communities.length > 0 ? (
                <>
                  {communities.map((community: any) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.id}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {community.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {community.memberCount} members
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {community.description}
                      </p>
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  No communities yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
