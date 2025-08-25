import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, CheckCircle, Calendar, Award, Settings } from "lucide-react"
import Header from "@/components/header"
import DoubtCard from "@/components/doubt-card"

interface PageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: PageProps) {
  const username = params.username || "anonymous-user"
  const user = users.find((u) => u.username === username) || users[0]

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{user.displayName}</h1>
                    {user.isProfessor && <Badge>Professor</Badge>}
                  </div>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {user.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{user.reputation} reputation</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{user.doubtsAsked}</div>
                <div className="text-sm text-muted-foreground">Questions Asked</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{user.doubtsResolved}</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{user.reputation}</div>
                <div className="text-sm text-muted-foreground">Reputation Points</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="answers">Answers</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6 space-y-4">
              {user.posts.map((post) => (
                <DoubtCard key={post.id} doubt={post} />
              ))}
            </TabsContent>

            <TabsContent value="answers" className="mt-6">
              <div className="space-y-4">
                {user.answers.map((answer) => (
                  <Card key={answer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{answer.votes}</div>
                          <div className="text-xs text-muted-foreground">votes</div>
                        </div>
                        <div className="flex-1">
                          <Link href={`/doubts/${answer.questionId}`} className="hover:text-primary">
                            <h3 className="font-medium mb-2">{answer.questionTitle}</h3>
                          </Link>
                          <p className="text-muted-foreground text-sm mb-2">{answer.excerpt}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>answered {answer.timeAgo}</span>
                            {answer.isAccepted && (
                              <Badge variant="secondary" className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="space-y-4">
                {user.recentActivity.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

// Sample data
const users = [
  {
    username: "john-doe",
    displayName: "John Doe",
    joinDate: "March 2024",
    doubtsAsked: 15,
    doubtsResolved: 8,
    reputation: 1247,
    isProfessor: false,
    posts: [
      {
        id: "p1",
        title: "Understanding recursion in programming",
        content: "Can someone explain how recursion works with a simple example?",
        author: "John Doe",
        authorType: "student" as const,
        timeAgo: "2 days ago",
        topic: "Programming",
        topicId: "programming",
        votes: 12,
        comments: 5,
        isResolved: true,
        image: null,
        location: "Global Community",
      },
    ],
    answers: [
      {
        id: "a1",
        questionId: "q1",
        questionTitle: "How to optimize database queries?",
        excerpt: "You can use indexing and query optimization techniques...",
        votes: 8,
        timeAgo: "1 week ago",
        isAccepted: true,
      },
    ],
    recentActivity: [
      {
        id: "ra1",
        description: "Answered a question about binary search",
        timeAgo: "2 hours ago",
      },
      {
        id: "ra2",
        description: "Asked a question about React hooks",
        timeAgo: "1 day ago",
      },
    ],
  },
]
