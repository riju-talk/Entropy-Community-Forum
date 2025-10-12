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
import { GoogleLogoIcon } from "@radix-ui/react-icons"
import { signInWithGoogle } from "@/lib/firebase-client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AuthModal({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      setIsOpen(false)
    }
  }, [session])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const fbIdToken = await signInWithGoogle()
      signIn("credentials", {
        fbIdToken: fbIdToken,
        redirect: false,
      }).then((response: any) => {
        if (response?.ok) {
          setIsOpen(false)
          router.push("/subscription")
        }
      })
    } catch (error) {
      console.error("Google sign-in failed:", error)
      toast({
        title: "Google Sign-in Failed",
        description: "There was an issue signing in with Google. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
            <DialogTitle>Authentication</DialogTitle>
            <DialogDescription>Choose your preferred authentication method</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button disabled={isLoading} onClick={handleGoogleSignIn} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <GoogleLogoIcon className="mr-2 h-4 w-4" />
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
