import { Suspense } from "react"
import { getDoubts } from "@/app/actions/doubts"
import { DoubtsFeed } from "@/components/doubts-feed"
import { CommunityFilters } from "@/components/community-filters"

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { subject?: string; tag?: string; search?: string; page?: string }
}) {
  const page = parseInt(searchParams.page || "1")
  const { doubts, total, totalPages, hasMore } = await getDoubts({
    subject: searchParams.subject,
    tag: searchParams.tag,
    search: searchParams.search,
    page,
    limit: 15,
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">All Questions</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <main className="lg:col-span-3">
            <DoubtsFeed
              initialDoubts={doubts}
              currentPage={page}
              totalPages={totalPages}
              hasMore={hasMore}
            />
          </main>

          <aside className="lg:col-span-1">
            <CommunityFilters currentSubject={searchParams.subject} />
          </aside>
        </div>
      </div>
    </div>
  )
}
