import Image from "next/image"
import Link from "next/link"
import { Calendar, ChevronRight, Coffee, Home, MapPin, Music, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CampusLifePage() {
  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/70 z-10"></div>
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Students on campus"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Campus Life</h1>
            <p className="text-lg text-neutral-100 mb-8">
              Experience a vibrant, diverse community where learning extends beyond the classroom
            </p>
          </div>
        </div>
      </section>

      {/* Overview Tabs */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="housing" className="w-full">
            <TabsList className="mb-8 w-full max-w-3xl mx-auto grid grid-cols-4 h-auto">
              <TabsTrigger value="housing" className="py-2">
                Housing
              </TabsTrigger>
              <TabsTrigger value="dining" className="py-2">
                Dining
              </TabsTrigger>
              <TabsTrigger value="activities" className="py-2">
                Activities
              </TabsTrigger>
              <TabsTrigger value="support" className="py-2">
                Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="housing" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative h-[400px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=800&width=600"
                    alt="Student housing"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-800 mb-6">Student Housing</h2>
                  <p className="text-neutral-600 mb-6">
                    Our residential facilities provide comfortable, safe, and inclusive living environments that foster
                    community and academic success. From traditional residence halls to apartment-style living, we offer
                    options to meet diverse needs and preferences.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Residence Halls</h3>
                        <p className="text-neutral-600 text-sm">
                          Traditional and suite-style accommodations for undergraduate students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Apartments</h3>
                        <p className="text-neutral-600 text-sm">
                          Independent living options for upper-level and graduate students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Global Living-Learning Communities</h3>
                        <p className="text-neutral-600 text-sm">
                          Themed housing that connects academics with residential life
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-slate-700 hover:bg-slate-600">Explore Housing Options</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dining" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-800 mb-6">Campus Dining</h2>
                  <p className="text-neutral-600 mb-6">
                    Our dining services offer diverse, nutritious, and delicious options that cater to various dietary
                    preferences and cultural traditions. From casual cafés to formal dining halls, you'll find fresh,
                    sustainable food choices across campus.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Coffee className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Main Dining Commons</h3>
                        <p className="text-neutral-600 text-sm">
                          All-you-care-to-eat dining with international stations and allergen-free options
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Coffee className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Global Cuisine Café</h3>
                        <p className="text-neutral-600 text-sm">
                          Rotating menus featuring authentic dishes from around the world
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Coffee className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Campus Markets</h3>
                        <p className="text-neutral-600 text-sm">
                          Convenient grab-and-go options with fresh, local ingredients
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-slate-700 hover:bg-slate-600">View Dining Locations</Button>
                </div>
                <div className="relative h-[400px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=800&width=600"
                    alt="Campus dining"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative h-[400px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=800&width=600"
                    alt="Student activities"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-800 mb-6">Student Activities</h2>
                  <p className="text-neutral-600 mb-6">
                    With over 200 student organizations, recreational sports, and cultural events, campus life at Global
                    University is always vibrant and engaging. Find your community, pursue your passions, and develop
                    leadership skills.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Student Organizations</h3>
                        <p className="text-neutral-600 text-sm">
                          Academic, cultural, service, and special interest groups
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Music className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Arts & Culture</h3>
                        <p className="text-neutral-600 text-sm">Performances, exhibitions, and cultural celebrations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Recreation & Wellness</h3>
                        <p className="text-neutral-600 text-sm">
                          Sports clubs, fitness classes, and outdoor adventures
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-slate-700 hover:bg-slate-600">Explore Student Life</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="support" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-800 mb-6">Student Support Services</h2>
                  <p className="text-neutral-600 mb-6">
                    We're committed to supporting your academic success and personal wellbeing throughout your
                    university journey. Our comprehensive support services are designed to help you thrive in all
                    aspects of campus life.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Academic Support</h3>
                        <p className="text-neutral-600 text-sm">Tutoring, writing center, and academic advising</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Health & Wellness</h3>
                        <p className="text-neutral-600 text-sm">Medical services, counseling, and wellness programs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-slate-700 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-slate-800">Career Development</h3>
                        <p className="text-neutral-600 text-sm">
                          Career counseling, internships, and job placement assistance
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-slate-700 hover:bg-slate-600">Access Support Resources</Button>
                </div>
                <div className="relative h-[400px] rounded-lg overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=800&width=600"
                    alt="Student support"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10">
            <h2 className="font-serif text-3xl font-bold text-slate-800">Upcoming Campus Events</h2>
            <Link href="/events" className="text-slate-700 hover:text-slate-600 flex items-center gap-1 mt-2 md:mt-0">
              View all events <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campusEvents.map((event, index) => (
              <Card key={index} className="border-neutral-200 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg p-3 min-w-[60px]">
                      <span className="font-serif font-bold text-xl text-slate-700">{event.day}</span>
                      <span className="text-sm text-neutral-600">{event.month}</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-slate-800">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-600 mb-4">{event.description}</p>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-slate-700 hover:text-slate-600 font-medium flex items-center gap-1"
                  >
                    Event details <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Facilities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl font-bold text-slate-800 mb-10 text-center">Campus Facilities</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <Card key={index} className="border-neutral-200 hover:shadow-md transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={facility.image || "/placeholder.svg?height=400&width=600"}
                    alt={facility.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">{facility.name}</h3>
                  <p className="text-neutral-600 mb-4">{facility.description}</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm text-neutral-500">{facility.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Tour CTA */}
      <section className="py-16 bg-slate-800 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Experience Campus Virtually</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-8">
            Can't visit in person? Take a virtual tour of our campus facilities, residence halls, and learning spaces.
          </p>
          <Button className="bg-white text-slate-800 hover:bg-neutral-100">Start Virtual Tour</Button>
        </div>
      </section>
    </main>
  )
}

// Sample data
const campusEvents = [
  {
    id: "cultural-festival",
    title: "International Cultural Festival",
    day: "15",
    month: "Oct",
    time: "12:00 - 20:00",
    location: "University Square",
    description:
      "Celebrate global diversity through performances, exhibitions, and culinary experiences from over 50 countries.",
  },
  {
    id: "guest-lecture",
    title: "Distinguished Speaker Series",
    day: "22",
    month: "Oct",
    time: "18:00 - 20:00",
    location: "Main Auditorium",
    description: "Nobel laureate Dr. Maria Gonzalez discusses sustainable development challenges and opportunities.",
  },
  {
    id: "career-fair",
    title: "Global Careers Fair",
    day: "05",
    month: "Nov",
    time: "10:00 - 16:00",
    location: "Student Center",
    description: "Connect with over 100 employers from around the world offering internships and career opportunities.",
  },
]

const facilities = [
  {
    name: "Global Learning Commons",
    description:
      "A state-of-the-art library and collaborative learning space with resources in multiple languages and advanced digital technologies.",
    location: "Central Campus",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Innovation Hub",
    description:
      "A creative space for interdisciplinary collaboration, featuring makerspaces, design studios, and startup incubation resources.",
    location: "North Campus",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Wellness Center",
    description:
      "Comprehensive health and wellness facilities including fitness centers, meditation spaces, and recreational sports venues.",
    location: "East Campus",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Performing Arts Center",
    description:
      "A cultural hub featuring theaters, galleries, and performance spaces that showcase student and professional works.",
    location: "West Campus",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Global Conference Center",
    description:
      "A versatile venue for academic conferences, cultural events, and community gatherings with advanced audiovisual capabilities.",
    location: "South Campus",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Sustainability Garden",
    description:
      "An educational green space featuring sustainable agriculture practices, renewable energy demonstrations, and outdoor classrooms.",
    location: "Central Campus",
    image: "/placeholder.svg?height=400&width=600",
  },
]
