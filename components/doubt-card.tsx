import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { MessageCircle, Eye, CheckCircle } from "lucide-react"
import { formatTimeAgo, getSubjectColor } from "@/lib/utils"
import VoteButtons from "./VoteButtons"

interface DoubtCardProps {
  doubt: {
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
}

export default function DoubtCard({ doubt }: DoubtCardProps) {
  const truncatedContent = doubt.content.length > 200 ? doubt.content.substring(0, 200) + "..." : doubt.content

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Vote buttons */}
          <VoteButtons itemId={doubt.id} itemType="doubt" votes={doubt.votes} className="flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={getSubjectColor(doubt.subject)}>{doubt.subject.replace("_", " ")}</Badge>

              {doubt.isResolved && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                {doubt.author ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={doubt.author.image || ""} />
                      <AvatarFallback className="text-xs">{doubt.author.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{doubt.author.name}</span>
                    {doubt.author.role === "TEACHER" && (
                      <Badge variant="outline" className="text-xs">
                        Teacher
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span>Anonymous</span>
                )}
                <span>•</span>
                <span>{formatTimeAgo(new Date(doubt.createdAt))}</span>
              </div>
            </div>

            {/* Title */}
            <Link href={`/doubts/${doubt.id}`} className="block group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{doubt.title}</h3>
            </Link>

            {/* Content preview */}
            <p className="text-muted-foreground mb-3 leading-relaxed">{truncatedContent}</p>

            {/* Image preview */}
            {doubt.imageUrl && (
              <div className="mb-3">
                <Image
                  src={doubt.imageUrl || "/placeholder.svg"}
                  alt="Doubt attachment"
                  width={400}
                  height={200}
                  className="rounded-md border max-w-full h-auto"
                />
              </div>
            )}

            {/* Tags */}
            {doubt.tags && doubt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {doubt.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {doubt.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{doubt.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{doubt._count.comments} answers</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{doubt.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
