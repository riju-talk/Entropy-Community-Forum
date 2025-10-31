"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, CheckCircle, Bookmark, ChevronUp, ChevronDown, Edit, Settings, Plus } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>You need to be signed in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
          <div className="lg:col-span-6">
            <Card className="mb-8">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                    <AvatarFallback className="text-3xl">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-1">{user?.name || "User"}</h1>
                    <p className="text-muted-foreground text-lg">{user?.email}</p>
                    <p className="text-sm text-muted-foreground mt-2">Joined Entropy Community</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">12</div>
                    <div className="text-sm text-muted-foreground">Questions Asked</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">8</div>
                    <div className="text-sm text-muted-foreground">Answers Given</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold mb-1">156</div>
                    <div className="text-sm text-muted-foreground">Reputation</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex flex-col items-center">
                        <Button variant="ghost" size="sm" className="h-6 px-1">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">1</span>
                        <Button variant="ghost" size="sm" className="h-6 px-1">
                          <Plus className="h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Computer Science
                          </Badge>
                          <Badge variant="outline">React</Badge>
                        </div>
                        <h4 className="font-medium mb-1">How to implement authentication in React applications?</h4>
                        <p className="text-sm text-muted-foreground">2 hours ago • 5 answers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex flex-col items-center">
                        <Button variant="ghost" size="sm" className="h-6 px-1">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">3</span>
                        <Button variant="ghost" size="sm" className="h-6 px-1">
                          <Plus className="h-4 w-4 rotate-180" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Mathematics
                          </Badge>
                          <Badge variant="outline">Calculus</Badge>
                        </div>
                        <h4 className="font-medium mb-1">Understanding definite integrals for probability distributions</h4>
                        <p className="text-sm text-muted-foreground">5 hours ago • 8 answers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader className="text-center pb-4">
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <Avatar className="h-16 w-16 border-4 border-background">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback className="text-2xl">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-12 pb-6 px-6 text-center">
                <h2 className="font-bold text-xl mb-1">{user?.name || "User"}</h2>
                <p className="text-muted-foreground text-sm mb-4">{user?.email}</p>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communities.map((community, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-slate-700">{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <span className="text-xs text-white">r</span>
                          </div>
                          <span className="text-sm font-medium">{community.name}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
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
