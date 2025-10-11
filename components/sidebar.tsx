"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  MessageSquare,
  Bot,
  Users,
  Trophy,
  Calendar,
  Plus,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Cog,
  Sparkles,
  CreditCard,
} from "lucide-react"
import AuthModal from "@/components/auth-modal"

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ask", label: "Ask Question", icon: MessageSquare },
  { href: "/ai-agent", label: "Spark", icon: Sparkles },
  { href: "/mentorship", label: "Mentorship", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/happenings", label: "Happenings", icon: Calendar },
]

const subjects = [
  { name: "Computer Science", count: 1234, icon: BookOpen },
  { name: "Mathematics", count: 987, icon: Calculator },
  { name: "Physics", count: 654, icon: Atom },
  { name: "Chemistry", count: 432, icon: FlaskConical },
  { name: "Biology", count: 321, icon: Dna },
  { name: "Engineering", count: 876, icon: Cog },
]

const trendingTopics = ["MachineLearning", "DataStructures", "QuantumPhysics", "ReactHooks", "LinearAlgebra"]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleCreateCommunity = () => {
    if (!session) {
      setShowAuthModal(true)
    } else {
      // Handle community creation for authenticated users
      console.log("Create community for authenticated user")
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}

            <Separator className="my-4" />

            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleCreateCommunity}>
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </CardContent>
        </Card>

        {/* Popular Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjects.map((subject) => {
              const Icon = subject.icon
              return (
                <div key={subject.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{subject.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {subject.count}
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trending Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  #{topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Create Community"
        description="Sign in to create and manage your own academic community."
      />
    </>
  )
}
