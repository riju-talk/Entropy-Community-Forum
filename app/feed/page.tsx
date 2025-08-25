import Image from "next/image"
import Link from "next/link"
import { Search, BookOpen, MessageCircle, CheckCircle, AlertCircle, User, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FeedPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="font-serif text-xl font-bold text-slate-800">Entropy</span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
                <Input
                  placeholder="Search for doubts, courses, or topics..."
                  className="pl-10 bg-neutral-50 border-neutral-200"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" /> Courses
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" /> My Doubts
              </Button>
              <Button className="bg-slate-700 hover:bg-slate-600 ml-2">Ask a Doubt</Button>
              <Button variant="ghost" size="icon" className="ml-2">
                <User className="h-5 w-5" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="md:col-span-3 lg:col-span-2">
            <Card className="border-neutral-200">
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/doubts/all">
                    <MessageCircle className="h-4 w-4 mr-2 text-neutral-500" /> All Doubts
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/doubts/solved">
                    <CheckCircle className="h-4 w-4 mr-2 text-sage-700" /> Solved Doubts
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/doubts/unsolved">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> Unsolved Doubts
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="mt-6">
              <h3 className="font-medium text-slate-800 mb-3">My Communities</h3>
              <div className="space-y-2">
                {communities.map((community) => (
                  <Button key={community.id} variant="ghost" className="w-full justify-start" asChild>
                    <Link href={`/community/${community.slug}`}>
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white mr-2">
                        <span className="text-xs">r</span>
                      </div>
                      {community.name}
                    </Link>
                  </Button>
                ))}
                <Button variant="outline" className="w-full mt-2">
                  Browse Communities
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-6 lg:col-span-7">
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
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="cs101">Introduction to CS</SelectItem>
                  <SelectItem value="ml101">Machine Learning</SelectItem>
                  <SelectItem value="ds101">Data Structures</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full sm:w-auto ml-auto">
                <Filter className="h-4 w-4 mr-2" /> More Filters
              </Button>
            </div>

            {/* Doubts Feed */}
            <div className="space-y-4">
              {doubts.map((doubt) => (
                <DoubtCard key={doubt.id} doubt={doubt} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-slate-100">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="md:col-span-3">
            <Card className="border-neutral-200 mb-6">
              <CardContent className="p-6">
                <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">Trending Topics</h2>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <Link key={index} href={`/topics/${topic.slug}`} className="flex items-center gap-3 group">
                      <div className="text-lg font-bold text-neutral-400 group-hover:text-slate-700">#{index + 1}</div>
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-slate-600">{topic.name}</p>
                        <p className="text-xs text-neutral-500">{topic.posts} posts</p>
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
                  {contributors.map((contributor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-700">{contributor.initials}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{contributor.name}</p>
                        <p className="text-xs text-neutral-500">{contributor.role}</p>
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

function DoubtCard({ doubt }) {
  return (
    <Card className="border-neutral-200 hover:shadow-sm transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <Button variant="ghost" size="sm" className="h-6 px-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-400"
              >
                <path d="m5 15 7-7 7 7" />
              </svg>
            </Button>
            <span className="text-sm font-medium text-neutral-600">{doubt.votes}</span>
            <Button variant="ghost" size="sm" className="h-6 px-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neutral-400"
              >
                <path d="m19 9-7 7-7-7" />
              </svg>
            </Button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/courses/${doubt.courseId}`} className="text-xs text-slate-700 font-medium">
                {doubt.course}
              </Link>
              <span className="text-neutral-400 text-xs">•</span>
              <span className="text-xs text-neutral-500">
                Asked by {doubt.author} • {doubt.timeAgo}
              </span>
            </div>
            <h3 className="font-medium text-slate-800 mb-2">{doubt.title}</h3>
            <div className="text-neutral-600 mb-4">{doubt.content}</div>
            {doubt.image && (
              <div className="mb-4 border border-neutral-200 rounded-md overflow-hidden">
                <Image
                  src={doubt.image || "/placeholder.svg"}
                  alt="Doubt attachment"
                  width={600}
                  height={300}
                  className="w-full"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-neutral-500 hover:text-slate-700">
                  <MessageCircle className="h-4 w-4 mr-1" /> {doubt.comments} Comments
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-neutral-500 hover:text-slate-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                  </svg>
                  Answer
                </Button>
              </div>
              {doubt.isResolved && (
                <Badge className="bg-sage-100 text-sage-700 hover:bg-sage-100">DOUBT RESOLVED</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data
const communities = [
  { id: "ml", name: "machine_learning", slug: "machine-learning" },
  { id: "db", name: "DBMS", slug: "dbms" },
  { id: "rs", name: "Remote_Sensing", slug: "remote-sensing" },
]

const doubts = [
  {
    id: "d1",
    title: "How to implement a neural network from scratch?",
    content:
      "I'm trying to understand the fundamentals of neural networks by implementing one without using any libraries. Can someone guide me through the basic steps?",
    author: "3rd year B.Tech",
    timeAgo: "15 hours ago",
    course: "Machine Learning",
    courseId: "ml101",
    votes: 12,
    comments: 5,
    isResolved: true,
    image: null,
  },
  {
    id: "d2",
    title: "Understanding database normalization",
    content: "I'm confused about the differences between 3NF and BCNF. Can someone explain with a practical example?",
    author: "2nd year B.Tech",
    timeAgo: "a day ago",
    course: "DBMS",
    courseId: "db101",
    votes: 8,
    comments: 3,
    isResolved: false,
    image: null,
  },
  {
    id: "d3",
    title: "Remote sensing data preprocessing techniques",
    content:
      "What are the best practices for preprocessing satellite imagery before applying machine learning algorithms?",
    author: "PhD Student",
    timeAgo: "2 days ago",
    course: "Remote Sensing",
    courseId: "rs101",
    votes: 15,
    comments: 7,
    isResolved: true,
    image: "/placeholder.svg?height=300&width=600",
  },
  {
    id: "d4",
    title: "Error in Python code for image classification",
    content: "I'm getting a dimension mismatch error when trying to run this CNN model. Can someone help me debug?",
    author: "4th year B.Tech",
    timeAgo: "3 hours ago",
    course: "Machine Learning",
    courseId: "ml101",
    votes: 4,
    comments: 2,
    isResolved: false,
    image: null,
  },
]

const trendingTopics = [
  { name: "Neural Networks", slug: "neural-networks", posts: 124 },
  { name: "Database Design", slug: "database-design", posts: 98 },
  { name: "Python Programming", slug: "python-programming", posts: 87 },
  { name: "Image Processing", slug: "image-processing", posts: 65 },
  { name: "Algorithm Analysis", slug: "algorithm-analysis", posts: 52 },
]

const contributors = [
  { name: "Dr. Sarah Chen", initials: "SC", role: "Professor" },
  { name: "Michael Okonjo", initials: "MO", role: "Teaching Assistant" },
  { name: "Elena Rodriguez", initials: "ER", role: "Teaching Fellow" },
  { name: "Raj Patel", initials: "RP", role: "Student Mentor" },
]
