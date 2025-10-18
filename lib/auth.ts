import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { adminAuth } from "@/lib/firebaseAdmin"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken as string | undefined
        if (!idToken) return null

        // Verify Firebase ID token
        const decoded = await adminAuth.verifyIdToken(idToken)
        const uid = decoded.uid
        const email = decoded.email || `${uid}@users.noreply.firebaseapp.com`
        const emailVerified = !!decoded.email_verified
        const name = (decoded as any).name || decoded.name || null
        const picture = (decoded as any).picture || decoded.picture || null

        // Upsert user in Prisma by email
        const user = await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: name ?? undefined,
            image: picture ?? undefined,
            emailVerified: emailVerified ? new Date() : undefined,
          },
          update: {
            name: name ?? undefined,
            image: picture ?? undefined,
            emailVerified: emailVerified ? new Date() : undefined,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
      }
      return session
    },
    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same domain
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/", // Redirect to home page for sign-in
    error: "/", // Error page
  },
  debug: process.env.NODE_ENV === "development",
}

// Export authOptions for backward compatibility with existing actions
export const authOptions = authConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
