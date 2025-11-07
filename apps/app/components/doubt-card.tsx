"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAuthModal } from "@/hooks/use-auth-modal"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, Eye, User, ArrowUp, ArrowDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DoubtCardProps {
  doubt: {
    id: string
    title: string
    content: string
    subject: string
    tags: string[]
    isAnonymous: boolean
    createdAt: Date | string // Allow both Date and string
    upvotes?: number
    downvotes?: number
    author?: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
    _count?: {
      answers: number
      votes?: number
    }
  }
}

export function DoubtCard({ doubt }: DoubtCardProps) {
  const { data: session, status } = useSession()
  const { open: openAuthModal } = useAuthModal()
  const [upvotes, setUpvotes] = useState(doubt.upvotes || 0)
  const [downvotes, setDownvotes] = useState(doubt.downvotes || 0)
  const [userVote, setUserVote] = useState<"UP" | "DOWN" | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [loadingVote, setLoadingVote] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const netVotes = upvotes - downvotes
  const isAuthenticated = status === "authenticated"

  // Fetch user's existing vote on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingVote(false)
      return
    }

    const fetchUserVote = async () => {
      try {
        const response = await fetch(`/api/doubts/${doubt.id}/vote`)
        const data = await response.json()
        setUserVote(data.userVote)
      } catch (error) {
        console.error("Error fetching user vote:", error)
      } finally {
        setLoadingVote(false)
      }
    }

    fetchUserVote()
  }, [doubt.id, isAuthenticated])

  const handleVote = async (type: "UP" | "DOWN", e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (status !== "authenticated") {
      openAuthModal()
      return
    }

    if (isVoting || loadingVote) return

    setIsVoting(true)

    const previousUpvotes = upvotes
    const previousDownvotes = downvotes
    const previousUserVote = userVote

    // Optimistic update
    if (userVote === type) {
      if (type === "UP") {
        setUpvotes(upvotes - 1)
      } else {
        setDownvotes(downvotes - 1)
      }
      setUserVote(null)
    } else {
      if (userVote === "UP") {
        setUpvotes(upvotes - 1)
        setDownvotes(downvotes + 1)
      } else if (userVote === "DOWN") {
        setDownvotes(downvotes - 1)
        setUpvotes(upvotes + 1)
      } else {
        if (type === "UP") {
          setUpvotes(upvotes + 1)
        } else {
          setDownvotes(downvotes + 1)
        }
      }
      setUserVote(type)
    }

    try {
      const response = await fetch(`/api/doubts/${doubt.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) throw new Error("Failed to vote")

      const data = await response.json()
      setUpvotes(data.upvotes)
      setDownvotes(data.downvotes)
    } catch (error) {
      setUpvotes(previousUpvotes)
      setDownvotes(previousDownvotes)
      setUserVote(previousUserVote)
      toast({
        title: "Error",
        description: "Failed to vote on question",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  const handleCardClick = () => {
    router.push(`/doubt/${doubt.id}`)
  }

  const hasAnswers = (doubt._count?.answers || 0) > 0

  // Safe date parsing helper
  const getValidDate = (dateInput: Date | string): Date => {
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date() // Return current date as fallback
      }
      return date
    } catch {
      return new Date() // Return current date on any error
    }
  }

  return (
    <div
      className="flex gap-3 py-4 px-4 border-b last:border-b-0 hover:bg-accent/5 transition-colors relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Vote Column */}
      <div
        className="flex flex-col items-center gap-1 min-w-[60px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded hover:bg-accent ${
            userVote === "UP" ? "text-orange-500 bg-orange-500/10" : ""
          }`}
          onClick={(e) => handleVote("UP", e)}
          disabled={isVoting || loadingVote}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>

        <span
          className={`text-lg font-bold ${
            netVotes > 0
              ? "text-orange-500"
              : netVotes < 0
              ? "text-blue-500"
              : "text-muted-foreground"
          }`}
        >
          {netVotes}
        </span>

        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded hover:bg-accent ${
            userVote === "DOWN" ? "text-blue-500 bg-blue-500/10" : ""
          }`}
          onClick={(e) => handleVote("DOWN", e)}
          disabled={isVoting || loadingVote}
        >
          <ArrowDown className="h-5 w-5" />
        </Button>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[15px] font-medium text-primary hover:text-primary/80 line-clamp-2 leading-snug flex-1">
            {doubt.title}
          </h3>

          {/* Answer count in top-right */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium shrink-0 ${
              hasAnswers
                ? "bg-green-500/10 text-green-600 dark:text-green-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{doubt._count?.answers || 0}</span>
          </div>
        </div>

        <p className="text-[13px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {doubt.content.substring(0, 180)}...
        </p>

        {/* Tags and Meta */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div
            className="flex flex-wrap gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {doubt.tags?.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            {doubt.isAnonymous ? (
              <>
                <User className="h-3.5 w-3.5" />
                <span>anonymous</span>
              </>
            ) : (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={doubt.author?.image || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {doubt.author?.name?.charAt(0) ||
                      doubt.author?.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {doubt.author?.name || doubt.author?.email?.split("@")[0]}
                </span>
              </>
            )}
            <span>
              asked {formatDistanceToNow(getValidDate(doubt.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
