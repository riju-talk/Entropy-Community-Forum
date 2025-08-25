import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, CheckCircle, AlertCircle, Flag, Calendar, Users } from "lucide-react"
import Header from "@/components/header"

interface PageProps {
  params: {
    slug: string
  }
}

export default function CommunityPage({ params }: PageProps) {
  const communitySlug = params.slug || "remote-sensing"
  const communityName = communitySlug.replace(/-/g, "_")
  const isEmpty = communitySlug === "remote-sensing"

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      {/* Community Header */}
      <section className="bg-slate-700 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="py-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <span className="font-serif text-2xl font-bold text-slate-700">r</span>
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold mb-2">{communityName}</h1>
              <p className="text-neutral-200 mb-4">
                A community for discussing {communityName.toLowerCase()} concepts, challenges, and solutions
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{isEmpty ? "1" : "245"} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Created Apr 23, 2025</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 md:self-start">
              Joined
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="md:col-span-3 lg:col-span-2">
            <Card className="border-neutral-200">
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Solved Posts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> Unsolved Posts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Flag className="h-4 w-4 mr-2 text-red-500" /> Report Spam
                </Button>
              </CardContent>
            </Card>

            <Card className="border-neutral-200 mt-6">
              <CardContent className="p-4">
                <h3 className="font-medium text-slate-800 mb-3">Related Communities</h3>
                <div className="space-y-3">
                  {relatedCommunities.map((community, index) => (
                    <Link
                      key={index}
                      href={`/community/${community.slug}`}
                      className="flex items-center gap-2 text-neutral-600 hover:text-slate-800"
                    >
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white">
                        <span className="text-xs">r</span>
                      </div>
                      <span className="text-sm">{community.name}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-6 lg:col-span-7">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="mb-6 w-full grid grid-cols-3 h-auto">
                <TabsTrigger value="posts" className="py-2">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="about" className="py-2">
                  About
                </TabsTrigger>
                <TabsTrigger value="members" className="py-2">
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-0">
                {isEmpty ? (
                  <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-slate-800 mb-2">No doubts yet</h2>
                    <p className="text-neutral-500 mb-6">Be the first to ask a doubt in this community</p>
                    <Button className="bg-slate-700 hover:bg-slate-600">Ask a Doubt</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <CommunityPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="about" className="mt-0">
                <Card className="border-neutral-200">
                  <CardContent className="p-6">
                    <h2 className="font-serif text-xl font-semibold text-slate-800 mb-4">About {communityName}</h2>
                    <p className="text-neutral-600 mb-6">
                      This community is dedicated to discussing topics related to {communitySlug.replace(/-/g, " ")}.
                      Members can ask questions, share resources, and collaborate on projects.
                    </p>

                    <h3 className="font-medium text-slate-800 mb-2">Community Rules</h3>
                    <ol className="list-decimal list-inside space-y-2 text-neutral-600 mb-6">
                      <li>Be respectful and constructive in all interactions</li>
                      <li>Stay on topic - all posts should be related to {communitySlug.replace(/-/g, " ")}</li>
                      <li>No spam or self-promotion</li>
                      <li>Properly format code and include relevant details in questions</li>
                      <li>Give credit when sharing others' work</li>
                    </ol>

                    <h3 className="font-medium text-slate-800 mb-2">Moderators</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-700">SC</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Dr. Sarah Chen</p>
                        <p className="text-xs text-neutral-500">Professor</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <Card className="border-neutral-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-serif text-xl font-semibold text-slate-800">Members</h2>
                      <span className="text-neutral-500">{isEmpty ? "1" : "245"} total</span>
                    </div>

                    <div className="space-y-4">
                      {communityMembers.map((member, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-slate-700">{member.initials}</span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{member.name}</p>
                              <p className="text-xs text-neutral-500">{member.role}</p>
                            </div>
                          </div>
                          <Badge
                            className={member.role === "Moderator" ? "bg-slate-700" : "bg-neutral-200 text-neutral-700"}
                          >
                            {member.role === "Moderator" ? "Mod" : "Member"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <aside className="md:col-span-3">
            <Card className="border-neutral-200 mb-6">
              <CardContent className="p-6">
                <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">About Community</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-700">{isEmpty ? "1" : "245"}</p>
                    <p className="text-neutral-600 text-sm">Members</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <p className="text-neutral-600 text-sm">Created Apr 23, 2025</p>
                  </div>
                  <Button className="w-full bg-slate-700 hover:bg-slate-600">Create Post</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6">
                <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">Community Resources</h2>
                <div className="space-y-3">
                  {communityResources.map((resource, index) => (
                    <Link key={index} href={resource.url} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mt-0.5">
                        {resource.icon}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 group-hover:text-slate-600">{resource.title}</p>
                        <p className="text-xs text-neutral-500">{resource.description}</p>
                      </div>
                    </Link>
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

function CommunityPostCard({ post }: { post: any }) {
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
            <span className="text-sm font-medium text-neutral-600">{post.votes}</span>
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
              <span className="text-xs text-neutral-500">
                Posted by {post.author} • {post.timeAgo}
              </span>
            </div>
            <h3 className="font-medium text-slate-800 mb-2">{post.title}</h3>
            <div className="text-neutral-600 mb-4">{post.content}</div>
            {post.image && (
              <div className="mb-4 border border-neutral-200 rounded-md overflow-hidden">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt="Post attachment"
                  width={600}
                  height={300}
                  className="w-full"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-neutral-500 hover:text-slate-700">
                  <MessageCircle className="h-4 w-4 mr-1" /> {post.comments} Comments
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
              {post.isResolved && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">DOUBT RESOLVED</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Sample data
const relatedCommunities = [
  { name: "machine_learning", slug: "machine-learning" },
  { name: "data_science", slug: "data-science" },
  { name: "GIS", slug: "gis" },
  { name: "image_processing", slug: "image-processing" },
]

const communityPosts = [
  {
    id: "p1",
    title: "How to preprocess satellite imagery for land cover classification?",
    content:
      "I'm working on a project to classify land cover types from Landsat imagery. What preprocessing steps should I take before feeding the data into a CNN?",
    author: "PhD Student",
    timeAgo: "2 days ago",
    votes: 15,
    comments: 7,
    isResolved: true,
    image: "/placeholder.svg?height=300&width=600",
  },
  {
    id: "p2",
    title: "Error when applying atmospheric correction to Sentinel-2 data",
    content:
      "I'm getting the following error when trying to apply atmospheric correction to my Sentinel-2 images. Has anyone encountered this before?",
    author: "3rd year B.Tech",
    timeAgo: "1 day ago",
    votes: 8,
    comments: 3,
    isResolved: false,
    image: null,
  },
  {
    id: "p3",
    title: "Best libraries for handling geospatial data in Python?",
    content:
      "I need to process a large amount of remote sensing data. Which Python libraries would you recommend for efficient processing and analysis?",
    author: "Masters Student",
    timeAgo: "4 hours ago",
    votes: 12,
    comments: 6,
    isResolved: true,
    image: null,
  },
]

const communityMembers = [
  { name: "Dr. Sarah Chen", initials: "SC", role: "Moderator" },
  { name: "Michael Okonjo", initials: "MO", role: "Member" },
  { name: "Elena Rodriguez", initials: "ER", role: "Member" },
  { name: "Raj Patel", initials: "RP", role: "Member" },
]

const communityResources = [
  {
    title: "Getting Started Guide",
    description: "Introduction to remote sensing concepts and tools",
    url: "/resources/remote-sensing/guide",
    icon: "📚",
  },
  {
    title: "Data Sources",
    description: "List of free and paid remote sensing data repositories",
    url: "/resources/remote-sensing/data",
    icon: "🛰️",
  },
  {
    title: "Code Repository",
    description: "Community-maintained code examples and utilities",
    url: "/resources/remote-sensing/code",
    icon: "💻",
  },
  {
    title: "Upcoming Events",
    description: "Webinars, workshops, and conferences",
    url: "/resources/remote-sensing/events",
    icon: "📅",
  },
]
