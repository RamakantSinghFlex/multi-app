"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { clearAllUserData } from "./utils/clear-user-data"
import { logger } from "./monitoring"

interface AuthContextType {
  user: any
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  error: string | null
  successMessage: string | null
  resetAuthError: () => void
  clearSuccessMessage: () => void
  setError: (error: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }

      setSuccessMessage("Login successful!")
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      logger.info("Logging out user")

      // Clear all user data from browser storage
      clearAllUserData()

      // Sign out from Auth.js
      await signOut({ redirect: false })

      setSuccessMessage("Logged out successfully.")
      router.push("/")
    } catch (error) {
      logger.error("Logout error:", error)

      // Even if there's an error, we should still clear all user data
      clearAllUserData()

      // Force sign out
      await signOut({ redirect: false })
      router.push("/")
    }
  }

  // Function to refresh user data
  const refreshUser = async () => {
    // With Auth.js, the session is automatically refreshed
    // This is just a placeholder for API compatibility
    return Promise.resolve()
  }

  // Reset auth error
  const resetAuthError = () => {
    setError(null)
  }

  // Clear success message
  const clearSuccessMessage = () => {
    setSuccessMessage(null)
  }

  // Set error message
  const setErrorMessage = (message: string) => {
    setError(message)
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        error,
        successMessage,
        resetAuthError,
        clearSuccessMessage,
        setError: setErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
