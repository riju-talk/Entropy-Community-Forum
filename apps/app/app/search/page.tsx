"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Loader2, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Result = {
  id: string
  title: string
  content: string
  subject: string
  votes: number
  createdAt: string
  author: { id: string; name: string | null; image: string | null; role: string | null } | null
  _count: { comments: number }
}

export default function SearchPage() {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const debouncedQ = useDebounce(q, 300)

  useEffect(() => {
    const run = async () => {
      if (!debouncedQ) {
        setResults([])
        setTotal(0)
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}&limit=12`)
        const data = await res.json()
        setResults(data.results || [])
        setTotal(data.total || 0)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [debouncedQ])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Search Doubts</h1>
          <p className="text-muted-foreground">Find questions, answers, and topics across Entropy.</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, content, or tag..."
            className="pl-9"
            autoFocus
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
        </div>

        {debouncedQ && (
          <div className="text-sm text-muted-foreground mb-4">
            Showing {results.length} of {total} results for "{debouncedQ}"
          </div>
        )}

        <div className="space-y-3">
          {results.map((r) => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-[3rem] text-center">
                    <div className="text-sm font-semibold">{r.votes}</div>
                    <div className="text-2xs text-muted-foreground">votes</div>
                  </div>
                  <div className="flex-1">
                    <Link href={`/doubts/${r.id}`} className="font-medium hover:underline">
                      {r.title}
                    </Link>
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.content}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">{r.subject}</Badge>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        {r._count.comments}
                      </Button>
                      {r.author?.name && <span className="text-xs text-muted-foreground">by {r.author.name}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && debouncedQ && results.length === 0 && (
            <div className="text-sm text-muted-foreground">No results found. Try another search.</div>
          )}
        </div>
      </div>
    </main>
  )
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
