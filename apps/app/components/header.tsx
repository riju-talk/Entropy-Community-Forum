"use client"

import Link from "next/link"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Bell, User, LogOut, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import AuthModal from "@/components/auth-modal"
import { AlphaBadge } from "@/components/ui/alpha-badge"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Header({ serverSession }: { serverSession?: Session | null }) {
  const client = useSession()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const router = useRouter()
  // Prefer serverSession when provided to avoid client-side flicker
  const session = typeof serverSession !== "undefined" ? serverSession : client.data
  const status = typeof serverSession !== "undefined" ? (serverSession ? "authenticated" : "unauthenticated") : client.status

  // debug: print server vs client session in the browser console
  // eslint-disable-next-line no-console
  console.debug("[Header] serverSession present:", typeof serverSession !== "undefined" ? !!serverSession : "<no-prop>")
  // eslint-disable-next-line no-console
  console.debug("[Header] serverSession (user email):", serverSession?.user?.email ?? null)
  // eslint-disable-next-line no-console
  console.debug("[Header] client.useSession status:", client.status, "client.data email:", client.data?.user?.email ?? null)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0 group">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg hidden sm:inline">Entropy</span>
                <AlphaBadge />
              </div>
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions, topics..."
                  className="pl-10 w-full bg-muted/50 border-muted-foreground/20 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button asChild className="hidden sm:flex gap-2" size="sm">
                <Link href="/ask">
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Ask question</span>
                </Link>
              </Button>

              <ThemeToggle />

              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              ) : session?.user ? (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                          <AvatarImage
                            src={session.user.image || ""}
                            alt={session.user.name || session.user.email || ""}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                            {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 leading-none">
                          {session.user.name && <p className="font-medium text-sm">{session.user.name}</p>}
                          {session.user.email && (
                            <p className="w-[160px] truncate text-xs text-muted-foreground">{session.user.email}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Your profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onSelect={async (event) => {
                          event.preventDefault()
                          try {
                            await nextAuthSignOut({ redirect: false })
                          } catch (err) {
                            console.error("next-auth signOut error", err)
                          }
                          // Reset any UI state by navigating home
                          router.push("/")
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <AuthModal>
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </AuthModal>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
