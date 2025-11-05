"use client"

import { useSession, signOut } from "next-auth/react"
import { useAuthModal } from "@/hooks/use-auth-modal"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Bell, User, LogOut, Settings, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session, status } = useSession()
  const { open: openAuthModal } = useAuthModal()
  const router = useRouter()

  const handleAskQuestion = () => {
    if (status !== "authenticated") {
      openAuthModal()
      return
    }
    router.push("/ask")
  }

  const handleCreateCommunity = () => {
    if (status !== "authenticated") {
      openAuthModal()
      return
    }
    router.push("/create-community")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="font-bold text-lg">Entropy</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions, topics..."
              className="w-full pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button onClick={handleAskQuestion} size="sm">
            <Plus className="h-5 w-5 mr-2" />
            Ask question
          </Button>
          <Button onClick={handleCreateCommunity} size="sm" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Create Community
          </Button>
          <ThemeToggle />
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || undefined} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/achievements">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={openAuthModal} size="sm" variant="outline">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}