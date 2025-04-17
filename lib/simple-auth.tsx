"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Simple types
type User = {
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  error: string | null
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  error: null,
})

// Mock user data
const MOCK_USER: User = {
  name: "Test User",
  email: "test@example.com",
  role: "student",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user")
      }
    }
  }, [])

  // Login with email/password
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "test@example.com" && password === "password") {
      setUser(MOCK_USER)
      localStorage.setItem("auth_user", JSON.stringify(MOCK_USER))
    } else {
      setError("Invalid email or password")
    }

    setIsLoading(false)
  }

  // Login with Google
  const loginWithGoogle = async () => {
    setIsLoading(true)
    setError(null)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Always succeed for demo purposes
    setUser(MOCK_USER)
    localStorage.setItem("auth_user", JSON.stringify(MOCK_USER))

    setIsLoading(false)
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext)
}
