"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp } from "lucide-react"
import DoubtCard from "@/components/doubt-card"

const mockDoubts = [
  {
    id: "1",
    title: "How to implement a binary search tree in JavaScript?",
    content:
      "I'm trying to understand how to implement a BST from scratch. Can someone provide a clear example with insertion and search methods?",
    subject: "COMPUTER_SCIENCE",
    tags: ["javascript", "data-structures", "binary-tree"],
    imageUrl: null,
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
    _count: {
      comments: 8,
      userVotes: 15,
    },
  },
  {
    id: "2",
    title: "Understanding calculus derivatives - chain rule confusion",
    content: "I'm having trouble with the chain rule in calculus. Can someone explain it step by step with examples?",
    subject: "MATHEMATICS",
    tags: ["calculus", "derivatives", "chain-rule"],
    imageUrl: null,
    isAnonymous: true,
    isResolved: true,
    votes: 23,
    views: 456,
    createdAt: "2024-01-14T15:45:00Z",
    author: null,
    _count: {
      comments: 12,
      userVotes: 23,
    },
  },
  {
    id: "3",
    title: "React hooks vs class components - when to use what?",
    content:
      "I'm learning React and confused about when to use hooks vs class components. What are the best practices?",
    subject: "COMPUTER_SCIENCE",
    tags: ["react", "hooks", "javascript", "frontend"],
    imageUrl: null,
    isAnonymous: false,
    isResolved: false,
    votes: 31,
    views: 789,
    createdAt: "2024-01-13T09:20:00Z",
    author: {
      id: "2",
      name: "Sarah Chen",
      image: null,
      role: "STUDENT",
    },
    _count: {
      comments: 15,
      userVotes: 31,
    },
  },
]

export default function DoubtsFeed() {
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Latest Questions
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="answers">Most Answers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unanswered">Unanswered</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {mockDoubts.map((doubt) => (
            <DoubtCard key={doubt.id} doubt={doubt} />
          ))}
        </TabsContent>

        <TabsContent value="trending" className="mt-6 space-y-4">
          {mockDoubts
            .filter((doubt) => doubt.votes > 20)
            .map((doubt) => (
              <DoubtCard key={doubt.id} doubt={doubt} />
            ))}
        </TabsContent>

        <TabsContent value="recent" className="mt-6 space-y-4">
          {mockDoubts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((doubt) => (
              <DoubtCard key={doubt.id} doubt={doubt} />
            ))}
        </TabsContent>

        <TabsContent value="unanswered" className="mt-6 space-y-4">
          {mockDoubts
            .filter((doubt) => !doubt.isResolved)
            .map((doubt) => (
              <DoubtCard key={doubt.id} doubt={doubt} />
            ))}
        </TabsContent>
      </Tabs>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">Load More Questions</Button>
      </div>
    </div>
  )
}
