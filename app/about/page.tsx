import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Award, BookOpen, Globe, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/70 z-10"></div>
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="University campus aerial view"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">About Global University</h1>
            <p className="text-lg text-neutral-100 mb-8">
              A tradition of excellence in education, research, and global citizenship since 1965
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-800 mb-6">Our Mission & Vision</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-slate-700 pl-6">
                  <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">Mission</h3>
                  <p className="text-neutral-600">
                    To cultivate knowledge, foster innovation, and empower individuals to address global challenges
                    through inclusive education, rigorous research, and meaningful community engagement.
                  </p>
                </div>
                <div className="border-l-4 border-slate-700 pl-6">
                  <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">Vision</h3>
                  <p className="text-neutral-600">
                    To be a leading global institution that transcends boundaries, embraces diversity, and inspires
                    transformative solutions for a more equitable, sustainable, and peaceful world.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-8 w-8 text-slate-700" />
                  </div>
                  <p className="font-medium text-slate-800">Excellence</p>
                </div>
                <div className="text-center">
                  <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-8 w-8 text-slate-700" />
                  </div>
                  <p className="font-medium text-slate-800">Global Perspective</p>
                </div>
                <div className="text-center">
                  <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-slate-700" />
                  </div>
                  <p className="font-medium text-slate-800">Inclusivity</p>
                </div>
                <div className="text-center">
                  <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-slate-700" />
                  </div>
                  <p className="font-medium text-slate-800">Innovation</p>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=800&width=600"
                alt="University values"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl font-bold text-slate-800 mb-10 text-center">Our History</h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-slate-200"></div>

            <div className="space-y-16">
              {timelineEvents.map((event, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? "flex-row-reverse" : ""}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-slate-700"></div>

                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "pl-8"}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">{event.year}</h3>
                      <p className="text-neutral-600">{event.description}</p>
                    </div>
                  </div>

                  {/* Empty space for the other side */}
                  <div className="w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl font-bold text-slate-800 mb-10 text-center">University Leadership</h2>

          <Tabs defaultValue="executive" className="w-full">
            <TabsList className="mb-8 w-full max-w-md mx-auto grid grid-cols-3 h-auto">
              <TabsTrigger value="executive" className="py-2">
                Executive Team
              </TabsTrigger>
              <TabsTrigger value="deans" className="py-2">
                Deans
              </TabsTrigger>
              <TabsTrigger value="board" className="py-2">
                Board of Trustees
              </TabsTrigger>
            </TabsList>

            <TabsContent value="executive" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {executiveTeam.map((person, index) => (
                  <Card key={index} className="border-neutral-200">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={person.image || "/placeholder.svg?height=400&width=300"}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-semibold text-slate-800 mb-1">{person.name}</h3>
                      <p className="text-neutral-500 mb-3">{person.title}</p>
                      <p className="text-neutral-600 text-sm">{person.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="deans" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {deans.map((person, index) => (
                  <Card key={index} className="border-neutral-200">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={person.image || "/placeholder.svg?height=400&width=300"}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-semibold text-slate-800 mb-1">{person.name}</h3>
                      <p className="text-neutral-500 mb-3">{person.title}</p>
                      <p className="text-neutral-600 text-sm">{person.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="board" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {boardMembers.map((person, index) => (
                  <Card key={index} className="border-neutral-200">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={person.image || "/placeholder.svg?height=400&width=300"}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-semibold text-slate-800 mb-1">{person.name}</h3>
                      <p className="text-neutral-500 mb-3">{person.title}</p>
                      <p className="text-neutral-600 text-sm">{person.bio}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Campus Locations */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl font-bold text-slate-800 mb-10 text-center">Our Global Campuses</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campuses.map((campus, index) => (
              <Card key={index} className="border-neutral-200 hover:shadow-md transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={campus.image || "/placeholder.svg?height=400&width=600"}
                    alt={campus.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">{campus.name}</h3>
                  <p className="text-neutral-600 mb-4">{campus.description}</p>
                  <Link
                    href={`/campus/${campus.id}`}
                    className="text-slate-700 hover:text-slate-600 font-medium flex items-center gap-1"
                  >
                    Explore campus <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-800 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Join Our Global Community</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-8">
            Become part of a diverse and innovative academic community dedicated to addressing the world's most pressing
            challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-slate-800 hover:bg-neutral-100">Apply Now</Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Visit
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

// Sample data
const timelineEvents = [
  {
    year: "1965",
    description:
      "Founded as the International Institute for Advanced Studies with a mission to foster global cooperation through education.",
  },
  {
    year: "1978",
    description:
      "Expanded to include four faculties: Sciences, Humanities, Business, and Social Sciences. Established the first international exchange programs.",
  },
  {
    year: "1992",
    description:
      "Granted full university status and renamed as Global University. Opened the first international campus in Singapore.",
  },
  {
    year: "2005",
    description:
      "Launched the Global Research Initiative, connecting researchers across continents to address pressing world challenges.",
  },
  {
    year: "2015",
    description:
      "Celebrated 50 years of academic excellence with the opening of the Innovation Center and expanded digital learning platforms.",
  },
  {
    year: "Present",
    description:
      "Operating across five continents with over 15,000 students from 120+ countries, continuing our mission of global education and research.",
  },
]

const executiveTeam = [
  {
    name: "Dr. Elena Rodriguez",
    title: "President",
    bio: "Dr. Rodriguez has led Global University since 2018. With a background in International Relations and Higher Education Leadership, she has strengthened the university's global partnerships and innovative programs.",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Prof. Kwame Osei",
    title: "Provost & Vice President for Academic Affairs",
    bio: "Prof. Osei oversees all academic programs and faculty affairs. His expertise in comparative education systems has been instrumental in developing our globally-relevant curriculum.",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Dr. Min-Jun Park",
    title: "Vice President for Research & Innovation",
    bio: "Dr. Park leads the university's research initiatives and innovation ecosystem. His background in interdisciplinary research has fostered collaboration across traditional academic boundaries.",
    image: "/placeholder.svg?height=400&width=300",
  },
]

const deans = [
  {
    name: "Prof. Sarah Chen",
    title: "Dean, Faculty of Science & Technology",
    bio: "Prof. Chen is an award-winning computer scientist specializing in artificial intelligence and its ethical applications. She leads the faculty's initiatives in sustainable technology development.",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Dr. Ahmed Hassan",
    title: "Dean, Faculty of Humanities & Arts",
    bio: "Dr. Hassan brings expertise in comparative literature and cultural studies. Under his leadership, the faculty has expanded its focus on digital humanities and global cultural exchange.",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Prof. Isabella Rossi",
    title: "Dean, Faculty of Business & Economics",
    bio: "Prof. Rossi's background in sustainable business practices and international finance guides the faculty's emphasis on responsible leadership and global economic systems.",
    image: "/placeholder.svg?height=400&width=300",
  },
]

const boardMembers = [
  {
    name: "Mr. Rajiv Mehta",
    title: "Chairperson, Board of Trustees",
    bio: "Mr. Mehta brings 30 years of experience in international business and philanthropy. He has been instrumental in expanding the university's global partnerships and financial sustainability.",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Dr. Fatima Al-Mansoori",
    title: "Vice Chair, Board of Trustees",
    bio: "Dr. Al-Mansoori is a renowned physician and public health advocate who guides the university's health sciences initiatives and community engagement programs.",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    name: "Ms. Gabriela Santos",
    title: "Trustee",
    bio: "Ms. Santos is a technology entrepreneur whose expertise in digital innovation has supported the university's advancement in online education and digital infrastructure.",
    image: "/placeholder.svg?height=400&width=300",
  },
]

const campuses = [
  {
    id: "main",
    name: "Main Campus - Global City",
    description:
      "Our flagship campus features state-of-the-art facilities, sustainable architecture, and vibrant community spaces across 200 acres.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "asia",
    name: "Asia Pacific Campus - Singapore",
    description:
      "Located in the heart of Singapore's education district, this campus specializes in business, technology, and Asian studies programs.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "europe",
    name: "European Campus - Barcelona",
    description:
      "Set in historic Barcelona, this campus offers programs in arts, humanities, and Mediterranean studies in a culturally rich environment.",
    image: "/placeholder.svg?height=400&width=600",
  },
]
