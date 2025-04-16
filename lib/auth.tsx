"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { login as apiLogin, logout as apiLogout, getMe } from "./api"
import { clearAllUserData } from "./utils/clear-user-data"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Function to fetch the current user
  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await getMe()

      if (error || !data) {
        setUser(null)
        setIsAuthenticated(false)
        return null
      }

      setUser(data)
      setIsAuthenticated(true)
      return data
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
      setIsAuthenticated(false)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check authentication status on mount and when pathname changes
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      await fetchUser()
    }

    checkAuth()
  }, [fetchUser, pathname])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const { data, error } = await apiLogin({ email, password })

      if (error || !data) {
        setIsLoading(false)
        return { success: false, error: error || "Login failed" }
      }

      // Fetch user data after successful login
      const userData = await fetchUser()

      if (!userData) {
        setIsLoading(false)
        return { success: false, error: "Failed to fetch user data" }
      }

      setIsLoading(false)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  // Logout function - enhanced with comprehensive data clearing
  const logout = async () => {
    setIsLoading(true)

    try {
      // First, clear all user data from the browser
      clearAllUserData()

      // Then attempt to logout via the API
      await apiLogout()
    } catch (error) {
      console.error("Logout error:", error)
      // Even if API logout fails, we still want to clear local state
    } finally {
      // Reset auth state
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)

      // Navigate to home page
      router.push("/")
      router.refresh()
    }
  }

  // Function to refresh user data
  const refreshUser = async () => {
    setIsLoading(true)
    await fetchUser()
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
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
