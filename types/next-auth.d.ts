import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string
      /** The user's role. */
      role: string
    } & DefaultSession["user"]
    /** The user's API token. */
    apiToken: string
  }

  interface User {
    id: string
    role: string
    token: string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's id. */
    id: string
    /** The user's role. */
    role: string
    /** The user's API token. */
    apiToken: string
  }
}
