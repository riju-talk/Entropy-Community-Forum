import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="md:col-span-3 lg:col-span-2">
            <Card className="border-neutral-200">
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">🔍</span> Asked Posts
                </Button>
                <Button variant="outline" className="w-full justify-start bg-slate-100">
                  <span className="mr-2">✓</span> Solved Posts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">💾</span> Saved Posts
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-6 lg:col-span-7">
            <Card className="border-neutral-200 mb-4">
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
                    <span className="text-sm font-medium text-neutral-600">1</span>
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
                      <span className="text-xs text-neutral-500">Asked by 18th year B.Tech • 7 hours ago</span>
                    </div>
                    <h3 className="font-medium text-slate-800 mb-2">test</h3>
                    <div className="text-neutral-600 mb-4">dfgfd</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          0 Comments
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                          Edit
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          Delete
                        </Button>
                      </div>
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
    </main>
  )
}

// Sample data
const communities = [{ name: "machine_learning" }, { name: "DBMS" }, { name: "Remote_Sensing" }]
