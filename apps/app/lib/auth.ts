// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
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
    uid?: string
  }
}

export const authOptions: NextAuthOptions = {
  // Using JWT strategy for Firebase integration instead of database adapter
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
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

          return {
            id: uid,
            name,
            email,
            image: picture,
            emailVerified: emailVerified ? new Date() : null,
          }
        } catch (err) {
          console.error("Firebase authorize error:", err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.name = user.name ?? undefined
        token.email = user.email ?? undefined
        token.picture = user.image ?? undefined
        token.uid = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.name = token.name ?? session.user.name
        session.user.email = token.email ?? session.user.email
        session.user.image = token.picture ?? session.user.image
        ;(session as any).uid = token.uid
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}
