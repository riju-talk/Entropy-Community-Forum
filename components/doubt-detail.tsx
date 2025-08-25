"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, ArrowDown, MessageCircle, Eye, CheckCircle, Share, Bookmark, Flag } from "lucide-react"
import { formatTimeAgo, getSubjectColor } from "@/lib/utils"

interface DoubtDetailProps {
  doubtId: string
}

export default function DoubtDetail({ doubtId }: DoubtDetailProps) {
  const [newAnswer, setNewAnswer] = useState("")
  const [votes, setVotes] = useState(15)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  // Mock data - replace with actual API call
  const doubt = {
    id: doubtId,
    title: "How to implement a binary search tree in JavaScript?",
    content: `I'm trying to understand how to implement a BST from scratch. Can someone provide a clear example with insertion and search methods?

Here's what I have so far:

\`\`\`javascript
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}
\`\`\`

But I'm not sure how to implement the insertion logic properly.`,
    subject: "COMPUTER_SCIENCE",
    tags: ["javascript", "data-structures", "binary-tree"],
    isAnonymous: false,
    isResolved: false,
    votes: 15,
    views: 234,
    createdAt: "2024-01-15T10:30:00Z",
    author: {
      id: "1",
      name: "Alex Johnson",
      image: null,
      role: "STUDENT",
    },
  }

  const answers = [
    {
      id: "1",
      content: `Here's a complete implementation of a Binary Search Tree in JavaScript:

\`\`\`javascript
class BST {
  constructor() {
    this.root = null;
  }

  insert(val) {
    const newNode = new TreeNode(val);
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    
    let current = this.root;
    while (true) {
      if (val === current.val) return undefined;
      if (val < current.val) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  search(val) {
    if (!this.root) return false;
    let current = this.root;
    while (current) {
      if (val === current.val) return true;
      if (val < current.val) {
        current = current.left;
      } else {
        current = current.right;
      }
    }
    return false;
  }
}
\`\`\`

The key insight is that for insertion, you traverse the tree comparing values until you find an empty spot where the new node should go.`,
      author: {
        id: "2",
        name: "Sarah Chen",
        image: null,
        role: "TEACHER",
      },
      votes: 23,
      isAccepted: true,
      createdAt: "2024-01-15T11:15:00Z",
    },
    {
      id: "2",
      content: `Great question! Here's a recursive approach that might be easier to understand:

\`\`\`javascript
class BST {
  constructor() {
    this.root = null;
  }

  insert(val) {
    this.root = this.insertNode(this.root, val);
  }

  insertNode(node, val) {
    if (!node) {
      return new TreeNode(val);
    }
    
    if (val < node.val) {
      node.left = this.insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertNode(node.right, val);
    }
    
    return node;
  }
}
\`\`\`

This recursive approach is often more intuitive for beginners.`,
      author: {
        id: "3",
        name: "Mike Rodriguez",
        image: null,
        role: "STUDENT",
      },
      votes: 12,
      isAccepted: false,
      createdAt: "2024-01-15T12:30:00Z",
    },
  ]

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      setUserVote(null)
      setVotes(votes + (type === "up" ? -1 : 1))
    } else {
      const prevVote = userVote
      setUserVote(type)
      if (prevVote) {
        setVotes(votes + (type === "up" ? 2 : -2))
      } else {
        setVotes(votes + (type === "up" ? 1 : -1))
      }
    }
  }

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswer.trim()) return

    // Handle answer submission
    console.log("Submitting answer:", newAnswer)
    setNewAnswer("")
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <Button
                variant={userVote === "up" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleVote("up")}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-lg font-bold">{votes}</span>
              <Button
                variant={userVote === "down" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleVote("down")}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getSubjectColor(doubt.subject)}>{doubt.subject.replace("_", " ")}</Badge>
                {doubt.isResolved && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolved
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl mb-4">{doubt.title}</CardTitle>

              <div className="prose max-w-none mb-4">
                <div className="whitespace-pre-wrap">{doubt.content}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {doubt.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Author and stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={doubt.author.image || ""} />
                    <AvatarFallback className="text-xs">{doubt.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{doubt.author.name}</span>
                  {doubt.author.role === "TEACHER" && (
                    <Badge variant="outline" className="text-xs">
                      Teacher
                    </Badge>
                  )}
                  <span>•</span>
                  <span>{formatTimeAgo(new Date(doubt.createdAt))}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{doubt.views} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{answers.length} Answers</h2>

        {answers.map((answer) => (
          <Card key={answer.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{answer.votes}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  {answer.isAccepted && <CheckCircle className="h-6 w-6 text-green-600 mt-2" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="prose max-w-none mb-4">
                    <div className="whitespace-pre-wrap">{answer.content}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={answer.author.image || ""} />
                        <AvatarFallback className="text-xs">{answer.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{answer.author.name}</span>
                      {answer.author.role === "TEACHER" && (
                        <Badge variant="outline" className="text-xs">
                          Teacher
                        </Badge>
                      )}
                      <span>•</span>
                      <span>{formatTimeAgo(new Date(answer.createdAt))}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Answer */}
      <Card>
        <CardHeader>
          <CardTitle>Your Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here... You can use markdown formatting."
              className="min-h-[150px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newAnswer.trim()}>
                Post Answer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
