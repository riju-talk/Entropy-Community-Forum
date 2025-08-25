import Link from "next/link"
import { ArrowLeft, Users, BookOpen, MessageCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import DoubtCard from "@/components/doubt-card"

interface PageProps {
  params: {
    id: string
  }
}

export default function CoursePage({ params }: PageProps) {
  const courseId = params.id
  const course = courses.find((c) => c.id === courseId) || courses[0]

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Feed
            </Link>
          </Button>
        </div>

        {/* Course Header */}
        <Card className="border-neutral-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h1 className="font-serif text-3xl font-bold text-slate-800 mb-2">{course.name}</h1>
                <p className="text-neutral-600 mb-4">{course.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1 text-neutral-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{course.students} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{course.doubts} doubts</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">{course.instructor}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Join Course</Button>
                <Button className="bg-slate-700 hover:bg-slate-600" asChild>
                  <Link href="/ask">Ask Doubt</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
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
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doubts</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full sm:w-auto ml-auto">
                <Filter className="h-4 w-4 mr-2" /> More Filters
              </Button>
            </div>

            <Tabs defaultValue="doubts" className="w-full">
              <TabsList className="mb-6 w-full grid grid-cols-3 h-auto">
                <TabsTrigger value="doubts" className="py-2">
                  Doubts
                </TabsTrigger>
                <TabsTrigger value="resources" className="py-2">
                  Resources
                </TabsTrigger>
                <TabsTrigger value="announcements" className="py-2">
                  Announcements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="doubts" className="mt-0 space-y-4">
                {courseDoubts.map((doubt) => (
                  <DoubtCard key={doubt.id} doubt={doubt} />
                ))}
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <div className="space-y-4">
                  {courseResources.map((resource) => (
                    <Card key={resource.id} className="border-neutral-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-slate-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800 mb-1">{resource.title}</h3>
                            <p className="text-neutral-600 text-sm mb-2">{resource.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{resource.type}</Badge>
                              <span className="text-xs text-neutral-500">{resource.uploadedBy}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="announcements" className="mt-0">
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} className="border-neutral-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-blue-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800 mb-1">{announcement.title}</h3>
                            <p className="text-neutral-600 mb-2">{announcement.content}</p>
                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                              <span>{announcement.author}</span>
                              <span>•</span>
                              <span>{announcement.date}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Card className="border-neutral-200 mb-6">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Course Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{course.students}</p>
                    <p className="text-neutral-600 text-sm">Students</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">{course.doubts}</p>
                    <p className="text-neutral-600 text-sm">Doubts</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">89%</p>
                    <p className="text-neutral-600 text-sm">Resolved</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-700">4.8</p>
                    <p className="text-neutral-600 text-sm">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 mb-6">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-700">{contributor.initials}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{contributor.name}</p>
                        <p className="text-xs text-neutral-500">{contributor.contributions} contributions</p>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {courseTags.map((tag) => (
                    <Badge key={tag.name} variant="outline" className="cursor-pointer hover:bg-slate-100">
                      {tag.name} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

// Sample data
const courses = [
  {
    id: "ml101",
    name: "Machine Learning Fundamentals",
    description: "Introduction to machine learning concepts, algorithms, and practical applications using Python.",
    instructor: "Dr. Sarah Chen",
    students: 1247,
    doubts: 89,
  },
  {
    id: "cs101",
    name: "Introduction to Computer Science",
    description: "Basic programming concepts, data structures, and problem-solving techniques.",
    instructor: "Prof. Michael Johnson",
    students: 2156,
    doubts: 156,
  },
]

const courseDoubts = [
  {
    id: "d1",
    title: "How to implement gradient descent from scratch?",
    content: "I'm trying to understand the mathematics behind gradient descent optimization algorithm...",
    author: "3rd year B.Tech",
    timeAgo: "2 hours ago",
    course: "Machine Learning",
    courseId: "ml101",
    votes: 8,
    comments: 3,
    isResolved: false,
    image: null,
  },
  {
    id: "d2",
    title: "Understanding overfitting and underfitting",
    content: "Can someone explain the difference between overfitting and underfitting with examples?",
    author: "2nd year B.Tech",
    timeAgo: "5 hours ago",
    course: "Machine Learning",
    courseId: "ml101",
    votes: 12,
    comments: 7,
    isResolved: true,
    image: "/placeholder.svg?height=200&width=400",
  },
]

const courseResources = [
  {
    id: "r1",
    title: "Linear Algebra for ML - Lecture Notes",
    description: "Comprehensive notes covering vectors, matrices, and eigenvalues",
    type: "PDF",
    uploadedBy: "Dr. Sarah Chen",
  },
  {
    id: "r2",
    title: "Python ML Starter Code",
    description: "Template code for common ML algorithms and data preprocessing",
    type: "Code",
    uploadedBy: "Teaching Assistant",
  },
]

const announcements = [
  {
    id: "a1",
    title: "Assignment 3 Due Date Extended",
    content: "Due to popular request, the deadline for Assignment 3 has been extended to next Friday.",
    author: "Dr. Sarah Chen",
    date: "2 days ago",
  },
  {
    id: "a2",
    title: "Guest Lecture on Deep Learning",
    content: "We'll have a special guest lecture on deep learning applications next Tuesday at 2 PM.",
    author: "Dr. Sarah Chen",
    date: "1 week ago",
  },
]

const topContributors = [
  { id: "c1", name: "Alex Kumar", initials: "AK", contributions: 23 },
  { id: "c2", name: "Maria Garcia", initials: "MG", contributions: 19 },
  { id: "c3", name: "David Chen", initials: "DC", contributions: 15 },
]

const courseTags = [
  { name: "python", count: 45 },
  { name: "algorithms", count: 32 },
  { name: "neural-networks", count: 28 },
  { name: "regression", count: 21 },
]
