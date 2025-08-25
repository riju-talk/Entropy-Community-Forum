import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in Supabase
          const { data: existingUser } = await supabase.from("users").select("*").eq("email", user.email).single()

          if (!existingUser) {
            // Create new user in Supabase
            const { error } = await supabase.from("users").insert({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: "google",
              provider_id: account.providerAccountId,
              created_at: new Date().toISOString(),
            })

            if (error) {
              console.error("Error creating user:", error)
              return false
            }
          }

          return true
        } catch (error) {
          console.error("Sign in error:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Get user data from Supabase
        const { data: userData } = await supabase.from("users").select("*").eq("email", session.user.email).single()

        if (userData) {
          session.user.id = userData.id
          session.user.role = userData.role
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
