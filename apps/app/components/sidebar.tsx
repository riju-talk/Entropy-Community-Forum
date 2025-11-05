"use client"

import { useSession, signOut } from "next-auth/react"
import { useAuthModal } from "@/hooks/use-auth-modal"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Home, HelpCircle, Users, Trophy, Calendar, LogOut, Plus, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { data: session, status } = useSession()
  const { open: openAuthModal } = useAuthModal()
  const pathname = usePathname()
  const router = useRouter()

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

    if (isAuthenticated && session?.user?.email) {
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
  }, [isAuthenticated, session?.user?.email])

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
      protected: true,
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
      comingSoon: true,
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      comingSoon: true,
    },
    {
      href: "/happenings",
      label: "Happenings",
      icon: Calendar,
      comingSoon: true,
    },
  ]

  const handleProtectedClick = (e: React.MouseEvent, href: string, isProtected?: boolean) => {
    if (isProtected && !isAuthenticated) {
      e.preventDefault()
      openAuthModal()
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/")
    } catch (err) {
      console.error("Sign out error", err)
    }
  }

  const userInitial = session?.user?.name?.charAt(0) ?? session?.user?.email?.charAt(0) ?? ""
  const displayName = session?.user?.name ?? session?.user?.email ?? ""

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full px-6 py-8">
      {/* Main Navigation */}
      <div className="space-y-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Explore
        </h2>
        <div className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleProtectedClick(e, item.href, item.protected)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 gap-3 rounded-md",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                  {item.comingSoon && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Soon
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Communities Section */}
      <div className="mt-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Communities
        </h2>
        <div className="space-y-3 mt-4">
          {communities.length > 0 ? (
            communities.slice(0, 5).map((community: any) => (
              <Button
                key={community.id}
                variant="ghost"
                className="w-full justify-start px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md"
                asChild
              >
                <Link href={`/communities/${community.id}`} className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
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
      <div className="mt-auto border-t pt-6">
        {isAuthenticated ? (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-primary/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Credits:</span>
                <Badge variant="secondary">{credits}</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={openAuthModal}
          >
            <User className="h-5 w-5 mr-2" />
            Sign in
          </Button>
        )}
      </div>
    </aside>
  )
}