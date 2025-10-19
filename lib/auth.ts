// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { adminAuth } from "@/lib/firebaseAdmin"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    name?: string
    email?: string
    picture?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "firebase",
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) return null
        try {
          const decoded = await adminAuth.verifyIdToken(credentials.idToken)
          const uid = decoded.uid
          const email = decoded.email || `${uid}@users.noreply.firebaseapp.com`
          const emailVerified = !!decoded.email_verified
          const name = (decoded as any).name ?? null
          const picture = (decoded as any).picture ?? null

          // Since we're not using adapter, return user directly
          return {
            id: uid,
            name,
            email,
            image: picture,
          }
        } catch (err) {
          console.error("Credentials authorize error:", err)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name ?? undefined
        token.email = user.email ?? undefined
        token.picture = user.image ?? undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name ?? session.user.name
        session.user.email = token.email ?? session.user.email
        session.user.image = token.picture ?? session.user.image
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  debug: process.env.NODE_ENV === "development",
}
