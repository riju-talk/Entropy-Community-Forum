import { DoubtsFeed } from "@/components/doubts-feed"
import { getDoubts } from "@/app/actions/doubts"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const { doubts, total, totalPages, hasMore } = await getDoubts({
    page: 1,
    limit: 15,
  })

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

      {/* Feed */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">All Questions</h2>
        <DoubtsFeed
          initialDoubts={doubts}
          currentPage={1}
          totalPages={totalPages}
          hasMore={hasMore}
        />
      </div>
    </div>
  )
}
