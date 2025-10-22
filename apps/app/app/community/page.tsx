import Link from "next/link"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import DoubtCard from "@/components/doubt-card"
import { AlphaBadge } from "@/components/ui/alpha-badge"

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-800 mb-2">
              Global Community <AlphaBadge />
            </h1>
            <p className="text-neutral-600">Connect with learners worldwide and share knowledge</p>
          </div>
          <Button className="bg-slate-700 hover:bg-slate-600 mt-4 md:mt-0" asChild>
            <Link href="/ask">Ask a Doubt</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <Card className="border-neutral-200 mb-6">
              <CardContent className="p-4 space-y-2">
                <h3 className="font-medium text-slate-800 mb-2">Browse Topics</h3>
                {topics.map((topic) => (
                  <Button key={topic.id} variant="ghost" className="w-full justify-start" asChild>
                    <Link href={`/topics/${topic.slug}`}>
                      <span className="w-2 h-2 rounded-full bg-slate-700 mr-2"></span>
                      {topic.name}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-slate-800 mb-3">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 text-sm">Active Users</span>
                    <span className="font-medium">2.4M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 text-sm">Questions Today</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 text-sm">Answers Today</span>
                    <span className="font-medium">3,891</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
              <Select defaultValue="latest">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="unanswered">Unanswered</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full sm:w-auto ml-auto bg-transparent">
                <Filter className="h-4 w-4 mr-2" /> More Filters
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6 w-full grid grid-cols-4 h-auto">
                <TabsTrigger value="all" className="py-2">
                  All
                </TabsTrigger>
                <TabsTrigger value="trending" className="py-2">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="unanswered" className="py-2">
                  Unanswered
                </TabsTrigger>
                <TabsTrigger value="following" className="py-2">
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0 space-y-4">
                {communityDoubts.map((doubt) => (
                  <DoubtCard key={doubt.id} doubt={doubt} />
                ))}
              </TabsContent>

              <TabsContent value="trending" className="mt-0 space-y-4">
                {communityDoubts
                  .filter((doubt) => doubt.votes > 20)
                  .map((doubt) => (
                    <DoubtCard key={doubt.id} doubt={doubt} />
                  ))}
              </TabsContent>

              <TabsContent value="unanswered" className="mt-0 space-y-4">
                {communityDoubts
                  .filter((doubt) => !doubt.isResolved)
                  .map((doubt) => (
                    <DoubtCard key={doubt.id} doubt={doubt} />
                  ))}
              </TabsContent>

              <TabsContent value="following" className="mt-0">
                <div className="text-center py-8">
                  <p className="text-neutral-500">Follow topics and users to see their content here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <Card className="border-neutral-200 mb-6">
              <CardContent className="p-6">
                <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">Trending Topics</h2>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <Link key={topic.id} href={`/topics/${topic.slug}`} className="flex items-center gap-3 group">
                      <div className="text-lg font-bold text-neutral-400 group-hover:text-slate-700">#{index + 1}</div>
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-slate-600">{topic.name}</p>
                        <p className="text-xs text-neutral-500">{topic.questions} questions today</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6">
                <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">Top Contributors</h2>
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-700">{contributor.initials}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800">{contributor.name}</p>
                          {contributor.isProfessor && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Prof</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">{contributor.reputation} reputation</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}

// Sample data
const topics = [
  { id: "1", name: "Computer Science", slug: "computer-science" },
  { id: "2", name: "Mathematics", slug: "mathematics" },
  { id: "3", name: "Physics", slug: "physics" },
  { id: "4", name: "Data Science", slug: "data-science" },
  { id: "5", name: "Programming", slug: "programming" },
  { id: "6", name: "Web Development", slug: "web-development" },
]

const communityDoubts = [
  {
    id: "cd1",
    title: "How to optimize database queries for large datasets?",
    content:
      "I'm working with a database containing millions of records and my queries are running very slowly. What are the best practices for optimization?",
    author: "DatabaseExplorer",
    authorType: "student" as const,
    timeAgo: "1 hour ago",
    topic: "Database Systems",
    topicId: "database-systems",
    votes: 34,
    comments: 12,
    isResolved: false,
    image: null,
    location: "Global Community",
  },
  {
    id: "cd2",
    title: "Understanding React hooks and their lifecycle",
    content:
      "Can someone explain the difference between useEffect, useMemo, and useCallback? When should I use each one?",
    author: "Prof. Lisa Wang",
    authorType: "professor" as const,
    timeAgo: "3 hours ago",
    topic: "Web Development",
    topicId: "web-development",
    votes: 28,
    comments: 15,
    isResolved: true,
    image: "/placeholder.svg?height=200&width=400",
    location: "Global Community",
  },
  {
    id: "cd3",
    title: "Machine learning model evaluation metrics",
    content:
      "What's the difference between precision, recall, and F1-score? How do I choose the right metric for my classification problem?",
    author: "MLEnthusiast",
    authorType: "student" as const,
    timeAgo: "5 hours ago",
    topic: "Machine Learning",
    topicId: "machine-learning",
    votes: 19,
    comments: 8,
    isResolved: false,
    image: null,
    location: "Global Community",
  },
]

const trendingTopics = [
  { id: "1", name: "Artificial Intelligence", slug: "artificial-intelligence", questions: 247 },
  { id: "2", name: "React Development", slug: "react-development", questions: 189 },
  { id: "3", name: "Data Structures", slug: "data-structures", questions: 156 },
  { id: "4", name: "Machine Learning", slug: "machine-learning", questions: 134 },
  { id: "5", name: "Python Programming", slug: "python-programming", questions: 98 },
]

const topContributors = [
  { id: "c1", name: "Prof. Michael Johnson", initials: "MJ", reputation: 15420, isProfessor: true },
  { id: "c2", name: "CodeMaster", initials: "CM", reputation: 8750, isProfessor: false },
  { id: "c3", name: "Dr. Lisa Wang", initials: "LW", reputation: 12300, isProfessor: true },
  { id: "c4", name: "AlgoExpert", initials: "AE", reputation: 6890, isProfessor: false },
]
