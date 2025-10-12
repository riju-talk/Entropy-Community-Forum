import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const fbIdToken = credentials?.fbIdToken
        if (!fbIdToken || typeof fbIdToken !== "string") {
          return null
        }

        // Call custom API route that uses Firebase Admin to verify the token.
        const authResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/firebase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fbIdToken }),
        })

        if (!authResponse.ok) {
          console.error("Firebase token verification failed")
          return null
        }

        const user = await authResponse.json()

        if (user) {
          // Any object returned will be saved in the session
          return user
        } else {
          // If you return null then an error message is displayed
          return null
        }
      },
      credentials: {
        fbIdToken: { label: "Firebase ID Token", type: "string" },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user as any
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same domain
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin", // Override default sign-in to use modal
    newUser: "/subscription", // Redirect new users to subscription
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
