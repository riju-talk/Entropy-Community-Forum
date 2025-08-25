import Link from "next/link"
import { ArrowLeft, Users, Settings, Plus, Pin, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"
import DoubtCard from "@/components/doubt-card"

interface PageProps {
  params: {
    id: string
  }
}

export default function ClassroomDetailPage({ params }: PageProps) {
  const classroomId = params.id
  const classroom = classrooms.find((c) => c.id === classroomId) || classrooms[0]

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href="/classrooms">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classrooms
            </Link>
          </Button>
        </div>

        {/* Classroom Header */}
        <Card className="border-neutral-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{classroom.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-slate-800">{classroom.name}</h1>
                  <p className="text-neutral-500 mb-1">{classroom.code}</p>
                  <p className="text-neutral-600">{classroom.description}</p>
                </div>
              </div>
              <div className="flex gap-2 md:ml-auto">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" /> {classroom.students} Students
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="stream" className="w-full">
              <TabsList className="mb-6 w-full grid grid-cols-4 h-auto">
                <TabsTrigger value="stream" className="py-2">
                  Stream
                </TabsTrigger>
                <TabsTrigger value="doubts" className="py-2">
                  Doubts
                </TabsTrigger>
                <TabsTrigger value="assignments" className="py-2">
                  Assignments
                </TabsTrigger>
                <TabsTrigger value="resources" className="py-2">
                  Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stream" className="mt-0">
                <div className="space-y-4">
                  {/* Announcements */}
                  {announcements.map((announcement) => (
                    <Card key={announcement.id} className="border-neutral-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Pin className="h-5 w-5 text-blue-700" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-slate-800">{announcement.title}</h3>
                              <Badge variant="outline">Announcement</Badge>
                            </div>
                            <p className="text-neutral-600 mb-3">{announcement.content}</p>
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

                  {/* Recent Doubts */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-800">Recent Doubts</h3>
                    {classroomDoubts.slice(0, 3).map((doubt) => (
                      <DoubtCard key={doubt.id} doubt={doubt} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="doubts" className="mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-slate-800">All Doubts</h3>
                  <Button size="sm" className="bg-slate-700 hover:bg-slate-600" asChild>
                    <Link href="/ask">
                      <Plus className="h-4 w-4 mr-2" /> Ask Doubt
                    </Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  {classroomDoubts.map((doubt) => (
                    <DoubtCard key={doubt.id} doubt={doubt} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="assignments" className="mt-0">
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id} className="border-neutral-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-orange-700" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-slate-800">{assignment.title}</h3>
                              <Badge variant={assignment.status === "submitted" ? "default" : "destructive"}>
                                {assignment.status}
                              </Badge>
                            </div>
                            <p className="text-neutral-600 mb-3">{assignment.description}</p>
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {assignment.dueDate}</span>
                              </div>
                              <span>Points: {assignment.points}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="border-neutral-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800 mb-1">{resource.title}</h3>
                            <p className="text-neutral-600 text-sm mb-2">{resource.description}</p>
                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                              <Badge variant="outline">{resource.type}</Badge>
                              <span>•</span>
                              <span>Uploaded by {resource.uploadedBy}</span>
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
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Card className="border-neutral-200 mb-6">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Classroom Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-600">Instructor</p>
                    <p className="font-medium text-slate-800">{classroom.instructor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Class Code</p>
                    <p className="font-medium text-slate-800">{classroom.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Students Enrolled</p>
                    <p className="font-medium text-slate-800">{classroom.students}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-800 text-sm">Assignment Due</p>
                    <p className="text-orange-700 text-sm">Binary Search Implementation</p>
                    <p className="text-orange-600 text-xs">Due in 2 days</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800 text-sm">Live Session</p>
                    <p className="text-blue-700 text-sm">Algorithm Analysis</p>
                    <p className="text-blue-600 text-xs">Tomorrow at 2 PM</p>
                  </div>
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
const classrooms = [
  {
    id: "cs101-fall2024",
    name: "Data Structures & Algorithms",
    code: "CS101-F24",
    description: "Learn fundamental data structures and algorithmic thinking",
    instructor: "Prof. Sarah Chen",
    students: 45,
  },
]

const announcements = [
  {
    id: "a1",
    title: "Welcome to Data Structures & Algorithms!",
    content: "Welcome everyone! Please review the syllabus and complete the prerequisite assessment by Friday.",
    author: "Prof. Sarah Chen",
    date: "3 days ago",
  },
]

const classroomDoubts = [
  {
    id: "cd1",
    title: "How does time complexity analysis work for recursive algorithms?",
    content:
      "I'm having trouble understanding how to calculate Big O notation for recursive functions like merge sort.",
    author: "Student #247",
    authorType: "student" as const,
    timeAgo: "1 hour ago",
    topic: "Algorithms",
    topicId: "algorithms",
    votes: 5,
    comments: 3,
    isResolved: false,
    image: null,
    location: "CS101-F24",
  },
]

const assignments = [
  {
    id: "as1",
    title: "Binary Search Implementation",
    description: "Implement binary search algorithm in your preferred programming language",
    dueDate: "Oct 25, 2024",
    points: 100,
    status: "pending",
  },
]

const resources = [
  {
    id: "r1",
    title: "Algorithm Analysis Slides",
    description: "Lecture slides covering Big O notation and complexity analysis",
    type: "PDF",
    uploadedBy: "Prof. Sarah Chen",
  },
]
