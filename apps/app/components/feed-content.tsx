import Link from "next/link"
import { CheckCircle, TrendingUp, Globe, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DoubtCard from "@/components/doubt-card"

export default function FeedContent() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="md:col-span-3 lg:col-span-2">
          <Card className="border-neutral-200 mb-6">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium text-slate-800 mb-2">Browse</h3>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/community">
                  <Globe className="h-4 w-4 mr-2 text-blue-600" /> Global Community
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/classrooms">
                  <BookOpen className="h-4 w-4 mr-2 text-purple-600" /> My Classrooms
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/doubts/solved">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Solved Doubts
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/doubts/trending">
                  <TrendingUp className="h-4 w-4 mr-2 text-orange-600" /> Trending
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <h3 className="font-medium text-slate-800 mb-3">Popular Topics</h3>
              <div className="space-y-2">
                {popularTopics.map((topic) => (
                  <Button key={topic.id} variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href={`/topics/${topic.slug}`}>
                      <span className="w-2 h-2 rounded-full bg-slate-700 mr-2"></span>
                      {topic.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="md:col-span-6 lg:col-span-7">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 w-full grid grid-cols-4 h-auto">
              <TabsTrigger value="all" className="py-2">
                All Doubts
              </TabsTrigger>
              <TabsTrigger value="my-doubts" className="py-2">
                My Doubts
              </TabsTrigger>
              <TabsTrigger value="following" className="py-2">
                Following
              </TabsTrigger>
              <TabsTrigger value="unanswered" className="py-2">
                Unanswered
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0 space-y-4">
              {doubts.map((doubt) => (
                <DoubtCard key={doubt.id} doubt={doubt} />
              ))}
            </TabsContent>

            <TabsContent value="my-doubts" className="mt-0">
              <div className="text-center py-8">
                <p className="text-neutral-500">You haven't asked any doubts yet.</p>
                <Button className="bg-slate-700 hover:bg-slate-600 mt-4" asChild>
                  <Link href="/ask">Ask Your First Doubt</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="following" className="mt-0">
              <div className="text-center py-8">
                <p className="text-neutral-500">Follow topics and users to see their content here.</p>
              </div>
            </TabsContent>

            <TabsContent value="unanswered" className="mt-0 space-y-4">
              {doubts
                .filter((doubt) => !doubt.isResolved)
                .map((doubt) => (
                  <DoubtCard key={doubt.id} doubt={doubt} />
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <aside className="md:col-span-3">
          <Card className="border-neutral-200 mb-6">
            <CardContent className="p-6">
              <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">Global Stats</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-slate-700">2.4M</p>
                  <p className="text-neutral-600 text-sm">Active Learners</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">847K</p>
                  <p className="text-neutral-600 text-sm">Doubts Resolved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">15K</p>
                  <p className="text-neutral-600 text-sm">Active Classrooms</p>
                </div>
                <Button className="w-full bg-slate-700 hover:bg-slate-600" asChild>
                  <Link href="/ask">Ask a Doubt</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200">
            <CardContent className="p-6">
              <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">Top Contributors</h2>
              <div className="space-y-3">
                {contributors.map((contributor) => (
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
  )
}

// Sample data
const popularTopics = [
  { id: "1", name: "Computer Science", slug: "computer-science" },
  { id: "2", name: "Mathematics", slug: "mathematics" },
  { id: "3", name: "Physics", slug: "physics" },
  { id: "4", name: "Data Science", slug: "data-science" },
  { id: "5", name: "Programming", slug: "programming" },
]

const doubts = [
  {
    id: "d1",
    title: "How to implement binary search algorithm efficiently?",
    content: "I'm struggling with the implementation of binary search. Can someone explain the logic step by step?",
    author: "Anonymous Student",
    authorType: "student",
    timeAgo: "2 hours ago",
    topic: "Algorithms",
    topicId: "algorithms",
    votes: 15,
    comments: 8,
    isResolved: true,
    image: null,
    location: "Global Community",
  },
  {
    id: "d2",
    title: "Understanding calculus derivatives for machine learning",
    content: "I need help understanding how derivatives work in the context of gradient descent optimization.",
    author: "Learning Enthusiast",
    authorType: "student",
    timeAgo: "4 hours ago",
    topic: "Mathematics",
    topicId: "mathematics",
    votes: 23,
    comments: 12,
    isResolved: false,
    image: "/placeholder.svg?height=200&width=400",
    location: "Global Community",
  },
  {
    id: "d3",
    title: "Best practices for React component architecture",
    content: "What are the recommended patterns for structuring React components in large applications?",
    author: "Prof. Sarah Chen",
    authorType: "professor",
    timeAgo: "6 hours ago",
    topic: "Web Development",
    topicId: "web-development",
    votes: 31,
    comments: 18,
    isResolved: true,
    image: null,
    location: "Global Community",
  },
]

const contributors = [
  { id: "c1", name: "Prof. Michael Johnson", initials: "MJ", reputation: 15420, isProfessor: true },
  { id: "c2", name: "CodeMaster", initials: "CM", reputation: 8750, isProfessor: false },
  { id: "c3", name: "Dr. Lisa Wang", initials: "LW", reputation: 12300, isProfessor: true },
  { id: "c4", name: "AlgoExpert", initials: "AE", reputation: 6890, isProfessor: false },
]
