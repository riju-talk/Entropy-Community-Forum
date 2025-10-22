"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, MessageCircle, Calendar, Search, Filter, Award, BookOpen } from "lucide-react"
import AuthModal from "@/components/auth-modal"

const mentors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "AI research scientist",
    company: "Google DeepMind",
    expertise: ["Machine learning", "Deep learning", "Computer vision"],
    rating: 4.9,
    reviews: 127,
    sessions: 450,
    price: "$80/hour",
    availability: "Available",
    bio: "PhD in computer science from Stanford. 8+ years in AI research.",
    achievements: ["Published 50+ papers", "Google AI Award 2023", "TEDx speaker"],
    languages: ["English", "Mandarin"],
    responseTime: "< 2 hours",
  },
  {
    id: 2,
    name: "Prof. Michael Rodriguez",
    title: "Quantum physics professor",
    company: "MIT",
    expertise: ["Quantum computing", "Theoretical physics", "Mathematics"],
    rating: 4.8,
    reviews: 89,
    sessions: 320,
    price: "$100/hour",
    availability: "Busy",
    bio: "Professor of physics at MIT specializing in quantum mechanics.",
    achievements: ["Nobel Prize nominee", "MIT Excellence Award", "Author of 3 books"],
    languages: ["English", "Spanish"],
    responseTime: "< 4 hours",
  },
  {
    id: 3,
    name: "Dr. Emily Watson",
    title: "Biotech engineer",
    company: "Moderna",
    expertise: ["Biotechnology", "Genetic engineering", "Pharmaceuticals"],
    rating: 4.9,
    reviews: 156,
    sessions: 280,
    price: "$75/hour",
    availability: "Available",
    bio: "Leading biotech engineer with expertise in mRNA technology.",
    achievements: ["COVID-19 vaccine development", "Biotech Innovation Award", "Nature publications"],
    languages: ["English", "French"],
    responseTime: "< 1 hour",
  },
]

export default function MentorshipPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("all")

  const expertiseAreas = [
    "all",
    "Machine learning",
    "Quantum computing",
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
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">Find your STEM mentor</h1>
        <p className="text-muted-foreground">Connect with industry experts and accelerate your learning journey</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Button variant="outline" className="bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Expert mentors", value: "500+" },
          { label: "Sessions completed", value: "10k+" },
          { label: "Average rating", value: "4.8" },
          { label: "Success rate", value: "95%" },
        ].map((stat, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="mentors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1">
          <TabsTrigger value="mentors">Find mentors</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-6">
          {/* Expertise Filter */}
          <div className="flex flex-wrap gap-2">
            {expertiseAreas.map((area) => (
              <Button
                key={area}
                variant={selectedExpertise === area ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedExpertise(area)}
                className="capitalize"
              >
                {area === "all" ? "All areas" : area}
              </Button>
            ))}
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src="/placeholder.svg" alt={mentor.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        {mentor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{mentor.name}</CardTitle>
                        <Badge
                          variant={mentor.availability === "Available" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {mentor.availability}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">{mentor.title}</CardDescription>
                      <p className="text-xs text-muted-foreground">{mentor.company}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{mentor.rating}</span>
                      <span className="text-muted-foreground">({mentor.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {mentor.sessions}
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
                  <p className="text-xs text-muted-foreground line-clamp-2">{mentor.bio}</p>

                  {/* Achievements */}
                  <div className="space-y-1">
                    {mentor.achievements.slice(0, 2).map((achievement) => (
                      <div key={achievement} className="flex items-center text-xs text-muted-foreground gap-1">
                        <Award className="h-3 w-3 text-yellow-500" />
                        {achievement}
                      </div>
                    ))}
                  </div>

                  {/* Languages and Response Time */}
                  <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                    <div>Languages: {mentor.languages.join(", ")}</div>
                    <div>Response: {mentor.responseTime}</div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-3 border-t gap-2">
                    <span className="font-semibold">{mentor.price}</span>
                    <div className="flex space-x-2 gap-1">
                      <AuthModal>
                        <Button variant="outline" size="sm" className="h-8 bg-transparent">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </AuthModal>
                      <AuthModal>
                        <Button size="sm" className="h-8">
                          <Calendar className="h-3 w-3 mr-1" />
                          Book
                        </Button>
                      </AuthModal>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI mastery program",
                description: "12-week intensive program covering machine learning and AI",
                duration: "12 weeks",
                participants: 25,
                price: "$1,200",
                level: "Intermediate",
              },
              {
                title: "Quantum computing bootcamp",
                description: "8-week program introducing quantum algorithms",
                duration: "8 weeks",
                participants: 15,
                price: "$800",
                level: "Beginner",
              },
              {
                title: "Biotech innovation track",
                description: "10-week program focusing on biotechnology applications",
                duration: "10 weeks",
                participants: 20,
                price: "$1,000",
                level: "Advanced",
              },
            ].map((program, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base">{program.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {program.level}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {program.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {program.participants} spots
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">{program.price}</span>
                    <AuthModal>
                      <Button size="sm" className="h-8">
                        Enroll now
                      </Button>
                    </AuthModal>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
