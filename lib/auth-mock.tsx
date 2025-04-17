"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define types
type User = {
  id: string
  name?: string
  email?: string
  image?: string
  role?: string
}

type Session = {
  user: User
  expires: string
  apiToken?: string
}

type AuthContextType = {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  signIn: (provider: string, options?: any) => Promise<any>
  signOut: () => Promise<any>
}

// Create context
const AuthContext = createContext<AuthContextType>({
  session: null,
  status: "unauthenticated",
  signIn: async () => null,
  signOut: async () => null,
})

// Mock session data
const mockSession: Session = {
  user: {
    id: "user-123",
    name: "Demo User",
    email: "user@example.com",
    role: "student",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  apiToken: "mock-api-token",
}

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  useEffect(() => {
    // Simulate loading session
    const timer = setTimeout(() => {
      setSession(mockSession)
      setStatus("authenticated")
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const signIn = async (provider: string, options?: any) => {
    console.log(`Signing in with ${provider}`, options)
    setStatus("loading")

    // Simulate authentication delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setSession(mockSession)
        setStatus("authenticated")
        resolve({ ok: true, error: null })
      }, 1000)
    })
  }

  const signOut = async () => {
    console.log("Signing out")
    setStatus("loading")

    // Simulate sign out delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setSession(null)
        setStatus("unauthenticated")
        resolve({ ok: true })
      }, 500)
    })
  }

  return <AuthContext.Provider value={{ session, status, signIn, signOut }}>{children}</AuthContext.Provider>
}

// Hook for using auth in components
export function useSession() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider")
  }

  return {
    data: context.session,
    status: context.status,
  }
}

// Export sign in and sign out functions
export function signIn(provider: string, options?: any) {
  const { signIn } = useContext(AuthContext)
  return signIn(provider, options)
}

export function signOut() {
  const { signOut } = useContext(AuthContext)
  return signOut()
}

// Auth function for server components (mock)
export function auth() {
  return {
    session: mockSession,
  }
}
