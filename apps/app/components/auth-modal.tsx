"use client"
import React from "react"
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
import { Loader2, Globe, Github } from "lucide-react"
import { signInWithGoogle, signInWithGithub, getIdToken, signOutClient } from "@/lib/firebaseClient"
import { signIn } from "next-auth/react"

export default function AuthModal({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(provider)
    try {
      if (provider === "google") {
        await signInWithGoogle()
      } else {
        await signInWithGithub()
      }

      const token = await getIdToken(true)
      if (!token) throw new Error("No ID token after sign-in")

      // Create NextAuth session using Credentials provider
      const result = await signIn("credentials", {
        idToken: token,
        redirect: false,
      })
      if (result?.error) throw new Error(result.error)

      setIsOpen(false)
      router.push("/subscription")
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
      await signOutClient()
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
            <DialogTitle>Welcome to entropy</DialogTitle>
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
                  <Globe className="mr-2 h-4 w-4" />
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
                  <Github className="mr-2 h-4 w-4" />
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
