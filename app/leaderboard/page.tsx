"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal, Award, Target, TrendingUp, Crown, Flame, Brain } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const leaderboardData = [
  {
    id: 1,
    rank: 1,
    name: "Alex Chen",
    username: "@alexchen",
    points: 15420,
    level: 47,
    streak: 28,
    badge: "AI Master",
    subjects: ["Computer Science", "Mathematics"],
    achievements: ["Problem Solver", "Mentor", "Top Contributor"],
    weeklyGain: 340,
    monthlyGain: 1250,
  },
  {
    id: 2,
    rank: 2,
    name: "Sarah Johnson",
    username: "@sarahj",
    points: 14890,
    level: 45,
    streak: 21,
    badge: "Physics Guru",
    subjects: ["Physics", "Engineering"],
    achievements: ["Research Star", "Helper", "Consistent"],
    weeklyGain: 280,
    monthlyGain: 980,
  },
  {
    id: 3,
    rank: 3,
    name: "Michael Rodriguez",
    username: "@mikero",
    points: 13750,
    level: 42,
    streak: 35,
    badge: "Bio Expert",
    subjects: ["Biology", "Chemistry"],
    achievements: ["Knowledge Seeker", "Community Leader", "Streak Master"],
    weeklyGain: 420,
    monthlyGain: 1100,
  },
  {
    id: 4,
    rank: 4,
    name: "Emily Watson",
    username: "@emilyw",
    points: 12980,
    level: 40,
    streak: 14,
    badge: "Math Wizard",
    subjects: ["Mathematics", "Statistics"],
    achievements: ["Problem Solver", "Tutor", "Rising Star"],
    weeklyGain: 190,
    monthlyGain: 750,
  },
  {
    id: 5,
    rank: 5,
    name: "David Kim",
    username: "@davidk",
    points: 11650,
    level: 38,
    streak: 19,
    badge: "Code Ninja",
    subjects: ["Computer Science", "Engineering"],
    achievements: ["Code Master", "Helper", "Innovator"],
    weeklyGain: 310,
    monthlyGain: 890,
  },
]

const achievements = [
  { name: "First Steps", description: "Complete your first doubt", icon: Target, rarity: "Common" },
  { name: "Problem Solver", description: "Solve 50 doubts", icon: Brain, rarity: "Uncommon" },
  { name: "Streak Master", description: "Maintain 30-day streak", icon: Flame, rarity: "Rare" },
  { name: "Mentor", description: "Help 100 students", icon: Award, rarity: "Epic" },
  { name: "AI Master", description: "Master AI concepts", icon: Brain, rarity: "Legendary" },
  { name: "Top Contributor", description: "Top 1% contributor", icon: Crown, rarity: "Legendary" },
]

const subjects = [
  { name: "Computer Science", leaders: 1250, icon: "Computer" },
  { name: "Mathematics", leaders: 980, icon: "Math" },
  { name: "Physics", leaders: 750, icon: "Physics" },
  { name: "Biology", leaders: 650, icon: "Biology" },
  { name: "Chemistry", leaders: 580, icon: "Chemistry" },
  { name: "Engineering", leaders: 920, icon: "Engineering" },
]

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("all-time")

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500"
      case "Uncommon":
        return "bg-green-500"
      case "Rare":
        return "bg-blue-500"
      case "Epic":
        return "bg-purple-500"
      case "Legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground mb-6">Compete, learn, and climb the ranks in the STEM community</p>
      </div>

      <Tabs defaultValue="leaderboard" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          {/* Period Filter */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {["all-time", "monthly", "weekly"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className="capitalize"
                >
                  {period.replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {leaderboardData.slice(0, 3).map((user, index) => (
              <Card
                key={user.id}
                className={`${index === 0 ? "md:order-2 border-yellow-500/50" : index === 1 ? "md:order-1" : "md:order-3"}`}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">{getRankIcon(user.rank)}</div>
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src="/placeholder.svg" alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription>{user.username}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-2">
                    <Badge className="bg-primary text-primary-foreground">{user.badge}</Badge>
                    <div className="text-2xl font-bold">{user.points.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">points</div>
                    <div className="flex justify-center space-x-4 text-xs">
                      <div className="flex items-center">
                        <span className="mr-1">Level {user.level}</span>
                      </div>
                      <div className="flex items-center">
                        <Flame className="h-3 w-3 mr-1 text-orange-500" />
                        {user.streak} days
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Full Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-12">{getRankIcon(user.rank)}</div>

                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {user.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">{user.points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                      <div className="flex items-center justify-end space-x-2 mt-1">
                        <div className="flex items-center text-xs">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+{user.weeklyGain}
                        </div>
                        <div className="flex items-center text-xs">
                          <Flame className="h-3 w-3 mr-1 text-orange-500" />
                          {user.streak}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${getRarityColor(achievement.rarity)}`}>
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{achievement.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card key={subject.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{subject.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription>{subject.leaders} active learners</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData
                      .slice(0, 3)
                      .filter((user) => user.subjects.includes(subject.name))
                      .map((user, index) => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <span className="text-sm font-medium w-4">#{index + 1}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt={user.name} />
                            <AvatarFallback className="text-xs">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.points.toLocaleString()} pts</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View Full Rankings
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
