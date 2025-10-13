"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, HelpCircle, Users, Trophy, Calendar, LogOut, Plus, User, Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import AuthModal from "@/components/auth-modal"

export default function Sidebar() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"

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
      {isAuthenticated ? (
        <div className="px-3 py-2">
          <div className="mt-2 space-y-1">
            <Button variant="ghost" className="w-full justify-start px-4" asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Profile
              </Link>
            </Button>
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
