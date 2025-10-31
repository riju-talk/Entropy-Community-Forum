"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal, Award, Target, TrendingUp, Crown, Flame, Brain, Zap } from "lucide-react"
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
    subjects: ["Computer science", "Mathematics"],
    achievements: ["Problem solver", "Mentor", "Top contributor"],
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
    badge: "Physics guru",
    subjects: ["Physics", "Engineering"],
    achievements: ["Research star", "Helper", "Consistent"],
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
    badge: "Bio expert",
    subjects: ["Biology", "Chemistry"],
    achievements: ["Knowledge seeker", "Community leader", "Streak master"],
    weeklyGain: 420,
    monthlyGain: 1100,
  },
]

const achievements = [
  { name: "First steps", description: "Complete your first doubt", icon: Target, rarity: "Common" },
  { name: "Problem solver", description: "Solve 50 doubts", icon: Brain, rarity: "Uncommon" },
  { name: "Streak master", description: "Maintain 30-day streak", icon: Flame, rarity: "Rare" },
  { name: "Mentor", description: "Help 100 students", icon: Award, rarity: "Epic" },
  { name: "AI master", description: "Master AI concepts", icon: Zap, rarity: "Legendary" },
  { name: "Top contributor", description: "Top 1% contributor", icon: Crown, rarity: "Legendary" },
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
    <div className="relative">
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm font-semibold shadow">Coming soon</div>
      </div>
      <div className="space-y-8 filter blur-sm opacity-80 pointer-events-none">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Compete, learn, and climb the ranks in the STEM community</p>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1">
          <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="subjects">By subject</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          {/* Period Filter */}
          <div className="flex justify-center gap-2">
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

          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {leaderboardData.slice(0, 3).map((user, index) => (
              <Card
                key={user.id}
                className={`${index === 0 ? "md:order-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20" : index === 1 ? "md:order-1 border-gray-400/50" : "md:order-3 border-amber-600/50"} hover:shadow-lg transition-shadow`}
              >
                <CardHeader className="text-center pb-3">
                  <div className="flex justify-center mb-3">{getRankIcon(user.rank)}</div>
                  <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-primary">
                    <AvatarImage src="/placeholder.svg" alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription>{user.username}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">{user.badge}</Badge>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">{user.points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                  <div className="flex justify-center space-x-4 text-xs bg-muted/50 p-2 rounded-lg">
                    <div className="flex items-center">
                      <span className="font-medium">Level {user.level}</span>
                    </div>
                    <div className="flex items-center">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {user.streak} days
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Full rankings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {leaderboardData.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-12 text-center">{getRankIcon(user.rank)}</div>

                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
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
                      <div className="flex flex-wrap gap-1 mt-2">
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
                      <div className="flex items-center justify-end space-x-2 mt-2">
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

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                      <achievement.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{achievement.name}</CardTitle>
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs mt-1`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-2">
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

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Computer science", "Mathematics", "Physics", "Biology", "Chemistry", "Engineering"].map((subject) => (
              <Card key={subject} className="hover:shadow-lg transition-shadow">
                <CardHeader className="border-b">
                  <CardTitle className="text-base">{subject}</CardTitle>
                  <CardDescription>245 active learners</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {leaderboardData.slice(0, 3).map((user, index) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <span className="text-sm font-medium w-5">#{index + 1}</span>
                        <Avatar className="h-8 w-8 border border-primary/20">
                          <AvatarImage src="/placeholder.svg" alt={user.name} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-600 text-white">
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
                  <Button variant="outline" className="w-full mt-4 bg-transparent h-8">
                    View all rankings
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
