"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import DoubtCard from "./doubt-card"
import { Card, CardContent } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { RefreshCw } from "lucide-react"

interface Doubt {
  id: string
  title: string
  content: string
  subject: string
  tags: string[]
  imageUrl?: string
  isAnonymous: boolean
  isResolved: boolean
  votes: number
  views: number
  createdAt: string
  author?: {
    id: string
    name: string
    image?: string
    role: string
  }
  _count: {
    comments: number
    userVotes: number
  }
}

interface DoubtsResponse {
  doubts: Doubt[]
  total: number
  hasMore: boolean
  page: number
}

export default function DoubtsFeed() {
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  })

  const fetchDoubts = async (pageNum: number, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const response = await fetch(`/api/doubts?page=${pageNum}&limit=10`)
      if (!response.ok) throw new Error("Failed to fetch doubts")

      const data: DoubtsResponse = await response.json()

      if (reset) {
        setDoubts(data.doubts)
      } else {
        setDoubts((prev) => [...prev, ...data.doubts])
      }

      setHasMore(data.hasMore)
      setPage(pageNum)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchDoubts(1, true)
  }, [])

  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading) {
      fetchDoubts(page + 1)
    }
  }, [inView, hasMore, loadingMore, loading, page])

  const handleRefresh = () => {
    setPage(1)
    fetchDoubts(1, true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Failed to load doubts: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (doubts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No doubts found. Be the first to ask a question!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {doubts.map((doubt) => (
        <DoubtCard key={doubt.id} doubt={doubt} />
      ))}

      {/* Loading more indicator */}
      {loadingMore && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intersection observer target */}
      {hasMore && <div ref={ref} className="h-10" />}

      {/* End of results */}
      {!hasMore && doubts.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">You've reached the end of the feed!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
