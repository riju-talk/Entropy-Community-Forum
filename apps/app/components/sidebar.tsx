"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, HelpCircle, Users, Trophy, Calendar, LogOut, Plus, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import AuthModal from "@/components/auth-modal"
import { signOutClient } from "@/lib/firebaseClient"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Sidebar() {
  const pathname = usePathname() || "/"
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  const [communities, setCommunities] = useState<any[]>([])
  const [credits, setCredits] = useState<number>(0)

  useEffect(() => {
    const ac = new AbortController()

    fetch("/api/communities", { signal: ac.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCommunities(Array.isArray(data) ? data : []))
      .catch((err: any) => {
        if (err?.name !== "AbortError") console.error(err)
      })

    if (status === "authenticated" && session?.user?.email) {
      fetch("/api/users/me/credits", { signal: ac.signal })
        .then((res) => (res.ok ? res.json() : { credits: 0 }))
        .then((d: any) => setCredits(typeof d?.credits === "number" ? d.credits : 0))
        .catch((err: any) => {
          if (err?.name !== "AbortError") console.error(err)
        })
    } else {
      setCredits(0)
    }

    return () => ac.abort()
  }, [status, session])

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/ask",
      label: "Ask question",
      icon: HelpCircle,
    },
    {
      href: "/ai-agent",
      label: "Spark AI",
      icon: Sparkles,
    },
    {
      href: "/mentorship",
      label: "Mentorship",
      icon: Users,
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
    },
    {
      href: "/happenings",
      label: "Happenings",
      icon: Calendar,
    },
  ]

  const handleSignOut = () => {
    signOut()
    signOutClient()
  }

  return (
    <div className="space-y-4 py-4">
      {/* Main Navigation */}
      <div className="px-3 py-2">
        <h2 className="mb-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explore</h2>
        <div className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start px-4 gap-2",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Communities Section */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Communities</h2>
          {isAuthenticated && (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild title="Create community">
              <Link href="/create-community">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-2 space-y-1">
          {communities.length > 0 ? (
            communities.map((community: any) => (
              <Button
                key={community.id}
                variant="ghost"
                className="w-full justify-start px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                asChild
              >
                <Link href={`/communities/${community.id}`} className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm truncate">{community.name}</span>
                </Link>
              </Button>
            ))
          ) : (
            <div className="px-4 text-xs text-muted-foreground">No communities yet</div>
          )}
        </div>
      </div>

      {/* User Section */}
      {isAuthenticated ? (
        <div className="px-3 py-2 mt-auto border-t pt-4">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-primary/20">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{session.user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">Premium</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Credits:</span>
                <Badge variant="secondary">{credits}</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full h-7 text-xs bg-transparent" onClick={handleSignOut}>
                <LogOut className="h-3 w-3 mr-1" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="px-3 py-2 mt-auto border-t pt-4">
          <AuthModal>
            <Button variant="default" size="sm" className="w-full">
              <User className="h-4 w-4 mr-2" />
              Sign in
            </Button>
          </AuthModal>
        </div>
      )}
    </div>
  )
}
