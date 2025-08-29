import DoubtsFeed from "@/components/doubts-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, MessageSquare, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Entropy</h1>
        <p className="text-muted-foreground">Your academic community for STEM learning and collaboration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">12,847</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">2,156</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="text-2xl font-bold">React</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DoubtsFeed />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Communities */}
        <div className="space-y-4">
          {/* Popular Communities */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "r/ComputerScience", members: "2.1M", icon: "💻" },
                  { name: "r/Mathematics", members: "1.8M", icon: "🔢" },
                  { name: "r/Physics", members: "1.5M", icon: "⚛️" },
                  { name: "r/Programming", members: "3.2M", icon: "👨‍💻" },
                  { name: "r/AskAcademia", members: "890K", icon: "🎓" },
                ].map((community) => (
                  <div
                    key={community.name}
                    className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                  >
                    <span className="text-lg">{community.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.members} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Machine Learning", "Data Structures", "Quantum Physics", "React Hooks", "Linear Algebra"].map(
                  (topic) => (
                    <div key={topic} className="text-sm text-primary hover:underline cursor-pointer">
                      #{topic.replace(" ", "")}
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
