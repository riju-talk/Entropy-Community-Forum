import DoubtsFeed from "@/components/doubts-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, MessageSquare, Award, Calculator, Atom, Code, GraduationCap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-3 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Entropy
        </h1>
        <p className="text-lg text-muted-foreground">Your academic community for STEM learning and collaboration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total questions</p>
                <p className="text-2xl font-bold">12,847</p>
              </div>
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active users</p>
                <p className="text-2xl font-bold">2,156</p>
              </div>
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolved today</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trending now</p>
                <p className="text-2xl font-bold">React</p>
              </div>
              <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Questions Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5" />
                Recent questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DoubtsFeed />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Popular Communities */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">Popular communities</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[
                  { name: "r/ComputerScience", members: "2.1M", icon: Code, color: "from-blue-500 to-cyan-500" },
                  { name: "r/Mathematics", members: "1.8M", icon: Calculator, color: "from-purple-500 to-pink-500" },
                  { name: "r/Physics", members: "1.5M", icon: Atom, color: "from-orange-500 to-red-500" },
                  { name: "r/Programming", members: "3.2M", icon: Code, color: "from-green-500 to-emerald-500" },
                  {
                    name: "r/AskAcademia",
                    members: "890K",
                    icon: GraduationCap,
                    color: "from-indigo-500 to-purple-500",
                  },
                ].map((community, idx) => {
                  const Icon = community.icon
                  return (
                    <div
                      key={community.name}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div
                        className={`h-8 w-8 bg-gradient-to-br ${community.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{community.name}</p>
                        <p className="text-xs text-muted-foreground">{community.members} members</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">Trending topics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {["Machine learning", "Data structures", "Quantum physics", "React hooks", "Linear algebra"].map(
                  (topic, idx) => (
                    <Button key={topic} variant="ghost" className="w-full justify-start text-left h-auto py-2" asChild>
                      <Link href={`/search?q=${topic}`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">#{topic.replace(/\s+/g, "")}</p>
                            <p className="text-xs text-muted-foreground">Trending now</p>
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Get Started */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6 text-center space-y-4">
              <Sparkles className="h-8 w-8 mx-auto text-purple-500" />
              <div>
                <h3 className="font-semibold mb-1">Start learning today</h3>
                <p className="text-sm text-muted-foreground">Ask your first question or explore communities</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/ask">Ask a question</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
