import type { AuthConfig } from "@auth/core"
import Google from "@auth/core/providers/google"
import Credentials from "@auth/core/providers/credentials"
import { getMe, login } from "./lib/api/auth"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const { data, error } = await login({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data) return null

          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
            role: data.user.role || data.user.roles?.[0] || "user",
            token: data.token,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For Google provider
        if (account.provider === "google") {
          try {
            // Check if user exists in your system
            const { data } = await getMe()

            if (data) {
              token.id = data.id
              token.role = data.role || data.roles?.[0] || "user"
              token.apiToken = data.token
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
          }
        } else {
          // For credentials provider
          token.id = user.id
          token.role = user.role
          token.apiToken = user.token
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.apiToken = token.apiToken as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
} satisfies AuthConfig

// Import this separately to avoid the default export issue
import { handlers } from "next-auth/standalone"
export { handlers }

// Import these from the correct location
import { auth, signIn, signOut } from "next-auth/react"
export { auth, signIn, signOut }
