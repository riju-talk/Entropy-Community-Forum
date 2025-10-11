import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ArrowLeft, Share, Bookmark, Eye, CheckCircle } from "lucide-react"
import { formatTimeAgo, getSubjectColor } from "@/lib/utils"
import VoteButtons from "./VoteButtons"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface DoubtDetailProps {
  doubt: any
  currentUser?: any
}

export default function DoubtDetail({ doubt, currentUser }: DoubtDetailProps) {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Feed
        </Link>
      </Button>

      {/* Main doubt */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Vote buttons */}
            <VoteButtons itemId={doubt.id} itemType="doubt" votes={doubt.votes} className="flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
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
                      <Avatar className="h-6 w-6">
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
              <h1 className="text-2xl font-bold mb-4">{doubt.title}</h1>

              {/* Content */}
              <div className="prose prose-sm max-w-none mb-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{doubt.content}</ReactMarkdown>
              </div>

              {/* Image */}
              {doubt.imageUrl && (
                <div className="mb-4">
                  <Image
                    src={doubt.imageUrl || "/placeholder.svg"}
                    alt="Doubt attachment"
                    width={600}
                    height={400}
                    className="rounded-md border max-w-full h-auto"
                  />
                </div>
              )}

              {/* Tags */}
              {doubt.tags && doubt.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {doubt.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                  <Eye className="h-4 w-4" />
                  <span>{doubt.views} views</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
