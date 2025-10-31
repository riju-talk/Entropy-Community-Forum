"use client"
import React from "react"
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
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { FcGoogle } from "react-icons/fc"
import { FaGithub } from "react-icons/fa"
import { signIn } from "next-auth/react"

export default function AuthModal({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState<string | null>(null)
  const { toast } = useToast()

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(provider)
    try {
      // Debug logs to help trace where auth requests are coming from in the browser.
      try {
        // eslint-disable-next-line no-console
        console.log("auth-modal: starting sign-in", {
          provider,
          href: typeof window !== "undefined" ? window.location.href : null,
          NEXT_PUBLIC_ENABLE_FIREBASE: process.env.NEXT_PUBLIC_ENABLE_FIREBASE,
          NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        })
      } catch (e) {
        /* ignore */
      }
      // Use next-auth OAuth providers directly. This will redirect the user
      // to the provider's consent screen. After successful auth next-auth
      // will redirect back to the app. We pass a callbackUrl to send users
      // to the subscription page on success.
      await signIn(provider, { callbackUrl: "/subscription" })
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
                  <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <FcGoogle className="mr-2 h-4 w-4" />
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
                  <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <FaGithub className="mr-2 h-4 w-4" />
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
