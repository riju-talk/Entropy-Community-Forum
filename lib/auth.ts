// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
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
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
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
  session: {
    strategy: "database",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.name = user.name ?? undefined
        token.email = user.email ?? undefined
        token.picture = user.image ?? undefined
      }
      return token
    },
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
        session.user.name = user.name ?? session.user.name
        session.user.email = user.email ?? session.user.email
        session.user.image = user.image ?? session.user.image
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
