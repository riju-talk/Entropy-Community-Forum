import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronRight, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/70 z-10"></div>
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Research laboratory"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Research & Innovation</h1>
            <p className="text-lg text-neutral-100 mb-8">
              Advancing knowledge and developing solutions to global challenges through collaborative research
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 border-b border-neutral-200 sticky top-16 z-30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
              <Input
                placeholder="Search research areas, publications, or faculty..."
                className="pl-10 bg-neutral-50 border-neutral-200"
              />
            </div>
            <Button className="bg-slate-700 hover:bg-slate-600 w-full md:w-auto">Search</Button>
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl font-bold text-slate-800 mb-10 text-center">Research Areas</h2>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8 w-full max-w-2xl mx-auto grid grid-cols-4 h-auto">
              <TabsTrigger value="all" className="py-2">
                All Areas
              </TabsTrigger>
              <TabsTrigger value="sustainability" className="py-2">
                Sustainability
              </TabsTrigger>
              <TabsTrigger value="technology" className="py-2">
                Technology
              </TabsTrigger>
              <TabsTrigger value="society" className="py-2">
                Society
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {researchAreas.map((area, index) => (
                  <ResearchAreaCard key={index} area={area} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sustainability" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {researchAreas
                  .filter((area) => area.category === "Sustainability")
                  .map((area, index) => (
                    <ResearchAreaCard key={index} area={area} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="technology" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {researchAreas
                  .filter((area) => area.category === "Technology")
                  .map((area, index) => (
                    <ResearchAreaCard key={index} area={area} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="society" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {researchAreas
                  .filter((area) => area.category === "Society")
                  .map((area, index) => (
                    <ResearchAreaCard key={index} area={area} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10">
            <h2 className="font-serif text-3xl font-bold text-slate-800">Featured Research</h2>
            <Link
              href="/research/projects"
              className="text-slate-700 hover:text-slate-600 flex items-center gap-1 mt-2 md:mt-0"
            >
              View all projects <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {featuredResearch.map((project, index) => (
              <Card key={index} className="border-neutral-200 hover:shadow-md transition-shadow duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                  <div className="relative h-48 md:h-auto overflow-hidden">
                    <Image
                      src={project.image || "/placeholder.svg?height=400&width=300"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-700">{project.category}</Badge>
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">{project.title}</h3>
                    <p className="text-neutral-600 mb-4">{project.description}</p>
                    <div className="flex items-center text-sm text-neutral-500 mb-4">
                      <span>Lead Researcher: {project.researcher}</span>
                    </div>
                    <Link
                      href={`/research/projects/${project.id}`}
                      className="text-slate-700 hover:text-slate-600 font-medium flex items-center gap-1"
                    >
                      Read more <ChevronRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Publications */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10">
            <h2 className="font-serif text-3xl font-bold text-slate-800">Recent Publications</h2>
            <Link
              href="/research/publications"
              className="text-slate-700 hover:text-slate-600 flex items-center gap-1 mt-2 md:mt-0"
            >
              View all publications <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-6">
            {publications.map((publication, index) => (
              <Card key={index} className="border-neutral-200 hover:shadow-sm transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-slate-700" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">{publication.title}</h3>
                      <p className="text-neutral-600 mb-3">{publication.authors}</p>
                      <p className="text-sm text-neutral-500 mb-4">
                        {publication.journal} • {publication.date}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {publication.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="bg-neutral-50">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <Link
                        href={`/research/publications/${publication.id}`}
                        className="text-slate-700 hover:text-slate-600 font-medium flex items-center gap-1"
                      >
                        Access publication <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Research Centers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-serif text-3xl font-bold text-slate-800 mb-10 text-center">
            Research Centers & Institutes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {researchCenters.map((center, index) => (
              <Card key={index} className="border-neutral-200 hover:shadow-md transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={center.image || "/placeholder.svg?height=400&width=600"}
                    alt={center.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">{center.name}</h3>
                  <p className="text-neutral-600 mb-4">{center.description}</p>
                  <Link
                    href={`/research/centers/${center.id}`}
                    className="text-slate-700 hover:text-slate-600 font-medium flex items-center gap-1"
                  >
                    Learn more <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration CTA */}
      <section className="py-16 bg-slate-800 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Research Collaboration Opportunities</h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-8">
            We welcome collaboration with academic institutions, industry partners, and community organizations to
            address complex global challenges through innovative research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-slate-800 hover:bg-neutral-100">Partner With Us</Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Research Funding Opportunities
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function ResearchAreaCard({ area }) {
  return (
    <Card className="border-neutral-200 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={area.image || "/placeholder.svg?height=400&width=600"}
          alt={area.title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-sage-100 text-sage-700">{area.category}</Badge>
        </div>
        <h3 className="font-serif text-xl font-semibold text-slate-800 mb-2">{area.title}</h3>
        <p className="text-neutral-600 mb-4 flex-grow">{area.description}</p>
        <Link
          href={`/research/areas/${area.id}`}
          className="text-slate-700 hover:text-slate-600 font-medium flex items-center gap-1 mt-auto"
        >
          Explore research <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

// Sample data
const researchAreas = [
  {
    id: "climate-solutions",
    title: "Climate Change Solutions",
    description:
      "Developing innovative approaches to mitigate climate change impacts and promote adaptation strategies across different regions and sectors.",
    category: "Sustainability",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "ai-ethics",
    title: "AI Ethics & Governance",
    description:
      "Exploring the ethical, legal, and social implications of artificial intelligence and developing frameworks for responsible AI development and deployment.",
    category: "Technology",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "global-health",
    title: "Global Health Systems",
    description:
      "Analyzing healthcare delivery models and developing solutions to improve access, quality, and equity in health services worldwide.",
    category: "Society",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "renewable-energy",
    title: "Renewable Energy Technologies",
    description:
      "Advancing the development and implementation of sustainable energy solutions, including solar, wind, and emerging technologies.",
    category: "Sustainability",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "digital-humanities",
    title: "Digital Humanities & Cultural Heritage",
    description:
      "Using digital technologies to preserve, analyze, and share cultural heritage and humanities research across global contexts.",
    category: "Society",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "quantum-computing",
    title: "Quantum Computing Applications",
    description:
      "Exploring practical applications of quantum computing in solving complex problems across multiple disciplines.",
    category: "Technology",
    image: "/placeholder.svg?height=400&width=600",
  },
]

const featuredResearch = [
  {
    id: "urban-sustainability",
    title: "Sustainable Urban Development Models for Growing Cities",
    description:
      "This research presents new frameworks for sustainable urban growth that balance environmental concerns with economic development needs in rapidly expanding urban centers.",
    researcher: "Dr. Sarah Chen",
    category: "Sustainability",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "quantum-applications",
    title: "Advances in Quantum Computing Applications",
    description:
      "Exploring practical applications of quantum computing in solving complex problems across multiple disciplines, from drug discovery to climate modeling.",
    researcher: "Prof. Michael Okonjo",
    category: "Technology",
    image: "/placeholder.svg?height=400&width=300",
  },
]

const publications = [
  {
    id: "climate-policy",
    title: "Comparative Analysis of Climate Policy Implementation in Developing Economies",
    authors: "Chen, S., Okonjo, M., Al-Farsi, K., & Rodriguez, E.",
    journal: "Journal of Global Environmental Policy",
    date: "September 2023",
    keywords: ["Climate Policy", "Developing Economies", "Implementation", "Comparative Analysis"],
  },
  {
    id: "ai-healthcare",
    title: "Ethical Frameworks for AI Implementation in Healthcare: A Global Perspective",
    authors: "Hassan, A., Park, M., Rossi, I., & Mehta, R.",
    journal: "International Journal of Medical Ethics",
    date: "August 2023",
    keywords: ["AI Ethics", "Healthcare", "Global Health", "Ethical Frameworks"],
  },
  {
    id: "cultural-heritage",
    title: "Digital Preservation of Indigenous Knowledge Systems: Methodologies and Challenges",
    authors: "Santos, G., Al-Mansoori, F., Chen, S., & Hassan, A.",
    journal: "Digital Humanities Quarterly",
    date: "July 2023",
    keywords: ["Indigenous Knowledge", "Digital Preservation", "Cultural Heritage", "Methodology"],
  },
]

const researchCenters = [
  {
    id: "climate-center",
    name: "Center for Climate Resilience",
    description:
      "Dedicated to developing practical solutions for climate adaptation and resilience across different regions and sectors.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "ai-center",
    name: "Institute for Responsible AI",
    description:
      "Focused on the ethical, legal, and social implications of artificial intelligence and developing frameworks for responsible AI.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "global-health",
    name: "Global Health Innovation Hub",
    description:
      "Working to improve health outcomes worldwide through interdisciplinary research and innovative healthcare delivery models.",
    image: "/placeholder.svg?height=400&width=600",
  },
]
