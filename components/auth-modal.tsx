"use client"
import React, { useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AuthModal({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      setIsOpen(false)
    }
  }, [session])

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(provider)
    try {
      const result = await signIn(provider, {
        callbackUrl: "/subscription",
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        setIsOpen(false)
        router.push("/subscription")
      }
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error)
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-in Failed`,
        description: `There was an issue signing in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}. Please try again later.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign-out failed:", error)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to Entropy</DialogTitle>
            <DialogDescription>Sign in to access all features and join the community</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              disabled={!!isLoading}
              onClick={() => handleSignIn("google")}
              className="w-full"
              variant="outline"
            >
              {isLoading === "google" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <span className="mr-2">🌐</span>
                  Continue with Google
                </>
              )}
            </Button>
            <Button
              disabled={!!isLoading}
              onClick={() => handleSignIn("github")}
              className="w-full"
              variant="outline"
            >
              {isLoading === "github" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <span className="mr-2">🐙</span>
                  Continue with GitHub
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
