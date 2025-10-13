import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, Bookmark, ChevronUp, ChevronDown } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="md:col-span-3 lg:col-span-2">
            <Card>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Asked Posts
                </Button>
                <Button variant="outline" className="w-full justify-start bg-secondary">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Solved Posts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved Posts
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-6 lg:col-span-7">
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <Button variant="ghost" size="sm" className="h-6 px-1">
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">1</span>
                    <Button variant="ghost" size="sm" className="h-6 px-1">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Computer Science
                      </Badge>
                      <Badge variant="outline">React</Badge>
                      <Badge variant="outline">JavaScript</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">How to implement authentication in React applications?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      I'm working on a React application and need to implement user authentication. I've looked into JWT tokens and OAuth, but I'm not sure which approach is best for my use case.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>2 hours ago</span>
                      <span>5 answers</span>
                      <span>12 views</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <Button variant="ghost" size="sm" className="h-6 px-1">
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">3</span>
                    <Button variant="ghost" size="sm" className="h-6 px-1">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Mathematics
                      </Badge>
                      <Badge variant="outline">Calculus</Badge>
                      <Badge variant="outline">Integration</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">Understanding definite integrals for probability distributions</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Can someone explain how definite integrals are used in probability density functions? I'm struggling with the connection between calculus and statistics.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>5 hours ago</span>
                      <span>8 answers</span>
                      <span>24 views</span>
                      <Badge className="bg-sage-100 text-sage-700 hover:bg-sage-100">DOUBT RESOLVED</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <aside className="md:col-span-3">
            <Card className="border-neutral-200 mb-6">
              <div className="relative h-40 bg-gradient-to-r from-slate-700 to-slate-600">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className="w-16 h-16 rounded-md bg-rose-300 flex items-center justify-center text-white font-bold text-2xl">
                    S
                  </div>
                </div>
              </div>
              <CardContent className="pt-12 pb-6 px-6 text-center">
                <h2 className="font-serif text-xl font-bold text-slate-800 mb-1">sdushyant074</h2>
                <p className="text-neutral-500 text-sm mb-4">sdushyant074@gmail.com</p>
              </CardContent>
            </Card>

            <Card className="border-neutral-200">
              <CardContent className="p-6">
                <h2 className="font-serif text-lg font-semibold text-slate-800 mb-4">Communities</h2>
                <div className="space-y-3">
                  {communities.map((community, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-700">{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-xs text-white">r</span>
                          </div>
                          <span className="text-sm font-medium text-slate-800">{community.name}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-full">
                        Joined
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}

// Sample data
const communities = [{ name: "machine_learning" }, { name: "DBMS" }, { name: "Remote_Sensing" }]
