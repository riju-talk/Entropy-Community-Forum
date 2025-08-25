"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, TrendingUp, Users, BookOpen, Bot, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Communities", href: "/communities", icon: Users },
  { name: "Study Groups", href: "/study-groups", icon: BookOpen },
  { name: "AI Assistant", href: "/ai-agent", icon: Bot },
]

const communities = [
  { name: "r/ComputerScience", members: "2.1M", color: "bg-blue-500" },
  { name: "r/Mathematics", members: "1.8M", color: "bg-green-500" },
  { name: "r/Physics", members: "1.5M", color: "bg-purple-500" },
  { name: "r/Programming", members: "3.2M", color: "bg-orange-500" },
  { name: "r/AskAcademia", members: "890K", color: "bg-red-500" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/ask">
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start bg-transparent">
              <Link href="/ai-agent">
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Communities */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Your Communities</h3>
          <div className="space-y-2">
            {communities.slice(0, 5).map((community) => (
              <div key={community.name} className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                <div className={cn("w-4 h-4 rounded-full", community.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{community.name}</p>
                  <p className="text-xs text-muted-foreground">{community.members}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Tags */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Trending Tags</h3>
          <div className="flex flex-wrap gap-2">
            {["javascript", "python", "react", "machine-learning", "algorithms", "data-structures"].map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
