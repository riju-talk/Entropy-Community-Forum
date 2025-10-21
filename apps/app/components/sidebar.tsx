"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, HelpCircle, Users, Trophy, Calendar, LogOut, Plus, User, Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import AuthModal from "@/components/auth-modal"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAuthenticated = !!session

  const [communities, setCommunities] = useState([])
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    fetch("/api/communities").then(res => res.json()).then(setCommunities).catch(console.error)

    if (session?.user?.email) {
      fetch("/api/users/me/credits").then(res => res.json()).then(d => setCredits(d.credits)).catch(console.error)
    }
  }, [session])

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/ask",
      label: "Ask Question",
      icon: HelpCircle,
    },
    {
      href: "/ai-agent",
      label: "Athena",
      icon: Sparkle,
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
  }

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Explore</h2>
        <div className="mt-2 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start px-4",
                pathname === item.href
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-slate-900 dark:hover:text-slate-50",
              )}
              asChild
            >
              <Link href={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Communities Section */}
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Communities</h2>
        <div className="mt-2 space-y-1">
          {communities.length > 0 ? (
            communities.map((community: any) => (
              <Button
                key={community.id}
                variant="ghost"
                className="w-full justify-start px-4 text-muted-foreground hover:text-slate-900 dark:hover:text-slate-50"
                asChild
              >
                <Link href={`/communities/${community.id}`} className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {community.name}
                </Link>
              </Button>
            ))
          ) : (
            <div className="px-4 text-sm text-muted-foreground">No communities yet</div>
          )}
          {isAuthenticated && (
            <Button variant="ghost" className="w-full justify-start px-4" asChild>
              <Link href="/create-community" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Community
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isAuthenticated ? (
        <div className="px-3 py-2">
          <div className="mt-2 space-y-1">
            <div className="px-4 py-2 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4" />
                <span className="font-medium">{session.user?.name}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Credits: {credits}
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start px-4" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2">
          <div className="mt-2 space-y-1">
            <AuthModal>
              <Button variant="ghost" className="w-full justify-start px-4">
                <Plus className="h-4 w-4" />
                Create Community
              </Button>
            </AuthModal>
            <AuthModal>
              <Button variant="ghost" className="w-full justify-start px-4">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </AuthModal>
          </div>
        </div>
      )}
    </div>
  )
}
