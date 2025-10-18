import DoubtsFeed from "@/components/doubts-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, MessageSquare, Award, Monitor, Calculator, Atom, Code, GraduationCap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome to entropy</h1>
        <p className="text-muted-foreground text-lg">Your academic community for STEM learning and collaboration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">12,847</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">2,156</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="text-2xl font-bold">React</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Questions Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DoubtsFeed />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Communities */}
        <div className="space-y-6">
          {/* Popular Communities */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Popular Communities</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[
                  { name: "r/ComputerScience", members: "2.1M", icon: Monitor },
                  { name: "r/Mathematics", members: "1.8M", icon: Calculator },
                  { name: "r/Physics", members: "1.5M", icon: Atom },
                  { name: "r/Programming", members: "3.2M", icon: Code },
                  { name: "r/AskAcademia", members: "890K", icon: GraduationCap },
                ].map((community) => (
                  <div
                    key={community.name}
                    className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <community.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.members} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {["Machine Learning", "Data Structures", "Quantum Physics", "React Hooks", "Linear Algebra"].map(
                  (topic) => (
                    <div key={topic} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 cursor-pointer transition-colors">
                      <TrendingUp className="h-4 w-4" />
                      <span>#{topic.replace(" ", "")}</span>
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
