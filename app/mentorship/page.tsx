"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, MessageCircle, Calendar, Search, Filter, Award, BookOpen } from "lucide-react"

const mentors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "AI Research Scientist",
    company: "Google DeepMind",
    expertise: ["Machine Learning", "Deep Learning", "Computer Vision"],
    rating: 4.9,
    reviews: 127,
    sessions: 450,
    price: "$80/hour",
    availability: "Available",
    bio: "PhD in Computer Science from Stanford. 8+ years in AI research with focus on computer vision and neural networks.",
    achievements: ["Published 50+ papers", "Google AI Award 2023", "TEDx Speaker"],
    languages: ["English", "Mandarin"],
    responseTime: "< 2 hours",
  },
  {
    id: 2,
    name: "Prof. Michael Rodriguez",
    title: "Quantum Physics Professor",
    company: "MIT",
    expertise: ["Quantum Computing", "Theoretical Physics", "Mathematics"],
    rating: 4.8,
    reviews: 89,
    sessions: 320,
    price: "$100/hour",
    availability: "Busy",
    bio: "Professor of Physics at MIT specializing in quantum mechanics and quantum computing applications.",
    achievements: ["Nobel Prize Nominee", "MIT Excellence Award", "Author of 3 books"],
    languages: ["English", "Spanish"],
    responseTime: "< 4 hours",
  },
  {
    id: 3,
    name: "Dr. Emily Watson",
    title: "Biotech Engineer",
    company: "Moderna",
    expertise: ["Biotechnology", "Genetic Engineering", "Pharmaceuticals"],
    rating: 4.9,
    reviews: 156,
    sessions: 280,
    price: "$75/hour",
    availability: "Available",
    bio: "Leading biotech engineer with expertise in mRNA technology and vaccine development.",
    achievements: ["COVID-19 Vaccine Development", "Biotech Innovation Award", "Nature Publications"],
    languages: ["English", "French"],
    responseTime: "< 1 hour",
  },
  {
    id: 4,
    name: "Alex Kim",
    title: "Senior Software Engineer",
    company: "Tesla",
    expertise: ["Robotics", "Autonomous Systems", "Python", "C++"],
    rating: 4.7,
    reviews: 203,
    sessions: 520,
    price: "$60/hour",
    availability: "Available",
    bio: "Senior engineer working on Tesla's autopilot systems and robotics. Passionate about mentoring new developers.",
    achievements: ["Tesla Innovation Award", "Open Source Contributor", "Robotics Competition Judge"],
    languages: ["English", "Korean"],
    responseTime: "< 3 hours",
  },
]

const mentorshipPrograms = [
  {
    id: 1,
    title: "AI Mastery Program",
    description: "12-week intensive program covering machine learning, deep learning, and AI applications",
    duration: "12 weeks",
    participants: 25,
    price: "$1,200",
    level: "Intermediate",
  },
  {
    id: 2,
    title: "Quantum Computing Bootcamp",
    description: "8-week program introducing quantum algorithms and quantum programming",
    duration: "8 weeks",
    participants: 15,
    price: "$800",
    level: "Beginner",
  },
  {
    id: 3,
    title: "Biotech Innovation Track",
    description: "10-week program focusing on biotechnology applications and research methods",
    duration: "10 weeks",
    participants: 20,
    price: "$1,000",
    level: "Advanced",
  },
]

export default function MentorshipPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("all")

  const expertiseAreas = [
    "all",
    "Machine Learning",
    "Quantum Computing",
    "Biotechnology",
    "Robotics",
    "Physics",
    "Mathematics",
  ]

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some((exp) => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesExpertise = selectedExpertise === "all" || mentor.expertise.includes(selectedExpertise)
    return matchesSearch && matchesExpertise
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your STEM Mentor</h1>
        <p className="text-muted-foreground mb-6">Connect with industry experts and accelerate your learning journey</p>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Expert Mentors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-sm text-muted-foreground">Sessions Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="mentors" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors">
          {/* Expertise Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {expertiseAreas.map((area) => (
              <Button
                key={area}
                variant={selectedExpertise === area ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedExpertise(area)}
                className="capitalize"
              >
                {area === "all" ? "All Areas" : area}
              </Button>
            ))}
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg" alt={mentor.name} />
                      <AvatarFallback>
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{mentor.name}</CardTitle>
                        <Badge variant={mentor.availability === "Available" ? "default" : "secondary"}>
                          {mentor.availability}
                        </Badge>
                      </div>
                      <CardDescription className="font-medium">{mentor.title}</CardDescription>
                      <p className="text-sm text-muted-foreground">{mentor.company}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Rating and Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-medium">{mentor.rating}</span>
                        <span className="text-muted-foreground ml-1">({mentor.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {mentor.sessions} sessions
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>

                    {/* Achievements */}
                    <div className="space-y-1">
                      {mentor.achievements.slice(0, 2).map((achievement) => (
                        <div key={achievement} className="flex items-center text-xs text-muted-foreground">
                          <Award className="h-3 w-3 mr-1 text-yellow-500" />
                          {achievement}
                        </div>
                      ))}
                    </div>

                    {/* Languages and Response Time */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Languages: {mentor.languages.join(", ")}</span>
                      <span>Response: {mentor.responseTime}</span>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-semibold text-lg">{mentor.price}</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Book
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorshipPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <Badge variant="secondary">{program.level}</Badge>
                  </div>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{program.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{program.participants} spots</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{program.price}</span>
                      <Button>Enroll Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No mentors found matching your criteria.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setSearchTerm("")
              setSelectedExpertise("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
