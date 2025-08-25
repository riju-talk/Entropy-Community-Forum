import Link from "next/link"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { BookOpen, TrendingUp, Users, Award } from "lucide-react"

const subjects = [
  { name: "Computer Science", value: "COMPUTER_SCIENCE", count: 1234 },
  { name: "Mathematics", value: "MATHEMATICS", count: 987 },
  { name: "Physics", value: "PHYSICS", count: 654 },
  { name: "Chemistry", value: "CHEMISTRY", count: 432 },
  { name: "Biology", value: "BIOLOGY", count: 321 },
  { name: "Engineering", value: "ENGINEERING", count: 876 },
]

const trendingTopics = [
  { name: "React Hooks", count: 45 },
  { name: "Calculus", count: 38 },
  { name: "Quantum Physics", count: 29 },
  { name: "Organic Chemistry", count: 24 },
  { name: "Data Structures", count: 19 },
]

export default function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/ask">Ask a Doubt</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/browse">Browse Doubts</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/leaderboard">Leaderboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Popular Subjects
          </h3>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <Link
                key={subject.value}
                href={`/?subject=${subject.value}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <span className="text-sm">{subject.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {subject.count}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending Topics
          </h3>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <div key={topic.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-muted-foreground mr-2">#{index + 1}</span>
                  <span className="text-sm">{topic.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {topic.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Community Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Doubts</span>
              <span className="text-sm font-medium">12,847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Resolved</span>
              <span className="text-sm font-medium">9,234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="text-sm font-medium">2,156</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
