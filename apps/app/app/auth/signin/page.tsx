"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Globe, Github } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { signInWithGoogle, signInWithGithub, getIdToken } from "@/lib/firebaseClient"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
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

      const result = await signIn("credentials", {
        idToken: token,
        redirect: false,
      })
      if (result?.error) throw new Error(result.error)

      router.push("/")
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error)
      toast({
        title: "Sign-in failed",
        description: `There was an issue signing in with ${provider}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">E</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Welcome to Entropy</h1>
        <p className="text-muted-foreground">Join our academic community</p>
      </div>

      <Card className="border-2">
        <CardHeader className="space-y-2">
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Choose your preferred sign-in method to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            disabled={!!isLoading}
            onClick={() => handleSignIn("google")}
            variant="outline"
            className="w-full h-10"
          >
            {isLoading === "google" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
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
            variant="outline"
            className="w-full h-10"
          >
            {isLoading === "github" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue as guest</span>
            </div>
          </div>

          <Button variant="ghost" className="w-full h-10" asChild>
            <Link href="/">Explore as guest</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>By signing in, you agree to our Terms of Service</p>
        <div className="flex justify-center gap-3">
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy policy
          </Link>
          <span>•</span>
          <Link href="#" className="hover:text-foreground transition-colors">
            Terms of service
          </Link>
        </div>
      </div>
    </div>
  )
}
