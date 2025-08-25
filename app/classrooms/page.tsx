import Link from "next/link"
import { Plus, Users, BookOpen, Lock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "@/components/header"

export default function ClassroomsPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-slate-800 mb-2">My Classrooms</h1>
            <p className="text-neutral-600">Private learning spaces for focused collaboration</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="/classrooms/join">Join Classroom</Link>
            </Button>
            <Button className="bg-slate-700 hover:bg-slate-600" asChild>
              <Link href="/classrooms/create">
                <Plus className="h-4 w-4 mr-2" /> Create Classroom
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="enrolled" className="w-full">
          <TabsList className="mb-6 w-full max-w-md grid grid-cols-3 h-auto">
            <TabsTrigger value="enrolled" className="py-2">
              Enrolled
            </TabsTrigger>
            <TabsTrigger value="teaching" className="py-2">
              Teaching
            </TabsTrigger>
            <TabsTrigger value="archived" className="py-2">
              Archived
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledClassrooms.map((classroom) => (
                <ClassroomCard key={classroom.id} classroom={classroom} userRole="student" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teaching" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachingClassrooms.map((classroom) => (
                <ClassroomCard key={classroom.id} classroom={classroom} userRole="teacher" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="archived" className="mt-0">
            <div className="text-center py-8">
              <p className="text-neutral-500">No archived classrooms</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function ClassroomCard({ classroom, userRole }: { classroom: any; userRole: "student" | "teacher" }) {
  return (
    <Card className="border-neutral-200 hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-lg text-slate-800">{classroom.name}</CardTitle>
              <p className="text-sm text-neutral-500">{classroom.code}</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Private
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600 text-sm mb-4">{classroom.description}</p>

        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{classroom.students} students</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{classroom.doubts} doubts</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            <span>Instructor: {classroom.instructor}</span>
          </div>
          <Button size="sm" asChild>
            <Link href={`/classrooms/${classroom.id}`}>Enter</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data
const enrolledClassrooms = [
  {
    id: "cs101-fall2024",
    name: "Data Structures & Algorithms",
    code: "CS101-F24",
    description: "Learn fundamental data structures and algorithmic thinking",
    instructor: "Prof. Sarah Chen",
    students: 45,
    doubts: 23,
    lastActivity: "2 hours ago",
  },
  {
    id: "ml201-fall2024",
    name: "Machine Learning Fundamentals",
    code: "ML201-F24",
    description: "Introduction to machine learning concepts and applications",
    instructor: "Dr. Michael Johnson",
    students: 38,
    doubts: 31,
    lastActivity: "1 day ago",
  },
]

const teachingClassrooms = [
  {
    id: "web301-fall2024",
    name: "Advanced Web Development",
    code: "WEB301-F24",
    description: "Modern web development with React, Node.js, and databases",
    instructor: "You",
    students: 28,
    doubts: 15,
    lastActivity: "3 hours ago",
  },
]
