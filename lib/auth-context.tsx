"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthState as AuthStateType, LoginCredentials, SignupCredentials, User } from "./types"
import { getMe, login as apiLogin, logout as apiLogout, signup as apiSignup } from "./api"
import { logger } from "./monitoring"
import { clearAllUserData } from "./utils/clear-user-data"

// Standardize the User type to always use roles as an array
// Update the AuthState interface to ensure roles is an array
export interface AuthState extends AuthStateType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  successMessage: string | null
}

// Update the AuthContextType interface to include all necessary methods
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => Promise<void>
  resetAuthError: () => void
  clearSuccessMessage: () => void
  checkAuth: () => Promise<boolean>
  setError: (error: string) => void
  refreshUser: () => Promise<void>
}

// Initial auth state
const initialState: AuthStateType = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  successMessage: null,
}

// Auth action types - add more specific typing
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token?: string; message?: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_RESET" }
  | { type: "AUTH_COMPLETE" }
  | { type: "LOGOUT_SUCCESS"; payload: string }
  | { type: "CLEAR_SUCCESS_MESSAGE" }
  | { type: "REFRESH_USER_SUCCESS"; payload: { user: User } }

// Auth reducer with improved error handling
function authReducer(state: AuthStateType, action: AuthAction): AuthStateType {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
        successMessage: null,
      }
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token || state.token,
        error: null,
        successMessage: action.payload.message || null,
      }
    case "AUTH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
        successMessage: null,
      }
    case "AUTH_RESET":
      return {
        ...state,
        error: null,
        successMessage: null,
      }
    case "AUTH_COMPLETE":
      return {
        ...state,
        isLoading: false,
      }
    case "LOGOUT_SUCCESS":
      return {
        ...initialState,
        isLoading: false,
        successMessage: action.payload,
      }
    case "CLEAR_SUCCESS_MESSAGE":
      return {
        ...state,
        successMessage: null,
      }
    case "REFRESH_USER_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
      }
    default:
      return state
  }
}

// Create auth context with the updated interface
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetAuthError: () => {},
  clearSuccessMessage: () => {},
  checkAuth: async () => false,
  setError: () => {},
  refreshUser: async () => {},
})

// Auth provider component with improved error handling and security
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: "AUTH_START" })
        logger.info("Starting auth check...")

        const token = typeof window !== "undefined" ? localStorage.getItem("milestone-token") : null

        if (!token) {
          logger.info("No token found, user is not authenticated")
          dispatch({ type: "AUTH_COMPLETE" })
          setAuthCheckComplete(true)
          return
        }

        logger.info("Token found, validating session...")
        const authResponse = await getMe()

        if (authResponse.error || !authResponse.data) {
          logger.warn("Session validation failed:", authResponse.error)
          if (typeof window !== "undefined") {
            localStorage.removeItem("milestone-token")
          }
          dispatch({ type: "AUTH_COMPLETE" })
          setAuthCheckComplete(true)
          return
        }

        // Ensure user data has roles as an array
        const userData = normalizeUserData(authResponse.data)

        logger.info("Session validation successful, user authenticated:", userData.email)
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: userData, token },
        })
        setAuthCheckComplete(true)
      } catch (error) {
        logger.error("Auth check error:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("milestone-token")
        }
        dispatch({
          type: "AUTH_FAILURE",
          payload: error instanceof Error ? error.message : "Authentication check failed",
        })
        setAuthCheckComplete(true)
      }
    }

    checkAuth()
  }, [])

  // Helper function to normalize user data (ensure roles is always an array)
  const normalizeUserData = (user: User): User => {
    if (!user) return user

    // If user has role but not roles, convert to roles array
    if (user.role && (!user.roles || !Array.isArray(user.roles))) {
      return {
        ...user,
        roles: [user.role],
      }
    }

    // If user has neither, set a default role
    if (!user.role && (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0)) {
      return {
        ...user,
        roles: ["user"],
      }
    }

    return user
  }

  // Login function with improved security and error handling
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "AUTH_START" })

    try {
      logger.info("Attempting login with:", { email: credentials.email })
      const response = await apiLogin(credentials)

      if (response.error || !response.data) {
        logger.error("Login failed:", response.error)
        dispatch({
          type: "AUTH_FAILURE",
          payload: response.error || "Login failed. Please try again.",
        })
        return
      }

      logger.info("Login successful:", { email: response.data.user.email })

      // Ensure token is stored in localStorage
      if (response.data.token && typeof window !== "undefined") {
        localStorage.setItem("milestone-token", response.data.token)
      }

      // Normalize user data to ensure roles is an array
      const userData = normalizeUserData(response.data.user)

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: userData,
          token: response.data.token,
          message: response.data.message || "Login successful!",
        },
      })

      // Redirect based on user roles
      if (userData.roles && userData.roles.length > 0) {
        const userRole = userData.roles[0] // Use the first role for redirection

        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else if (userRole === "parent") {
          router.push("/parent/dashboard")
        } else if (userRole === "tutor") {
          router.push("/tutor/dashboard")
        } else if (userRole === "student") {
          router.push("/student/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Fallback if no roles
        router.push("/dashboard")
      }
    } catch (error) {
      logger.error("Login error:", error)
      dispatch({
        type: "AUTH_FAILURE",
        payload: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    }
  }

  // Signup function with improved security and error handling
  const signup = async (credentials: SignupCredentials) => {
    dispatch({ type: "AUTH_START" })

    try {
      logger.info("Attempting signup with:", { email: credentials.email })

      // Ensure roles is an array
      if (!credentials.roles && credentials.role) {
        credentials.roles = [credentials.role]
      }

      const response = await apiSignup(credentials)

      if (response.error || !response.data) {
        logger.error("Signup failed:", response.error)
        dispatch({
          type: "AUTH_FAILURE",
          payload: response.error || "Signup failed. Please try again.",
        })
        return
      }

      logger.info("Signup successful:", { email: response.data.user.email })

      // Normalize user data
      const userData = normalizeUserData(response.data.user)

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: userData,
          token: response.data.token,
          message: response.data.message || "Account created successfully!",
        },
      })

      // Redirect based on user roles
      if (userData.roles && userData.roles.length > 0) {
        const userRole = userData.roles[0] // Use the first role for redirection

        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else if (userRole === "parent") {
          router.push("/parent/dashboard")
        } else if (userRole === "tutor") {
          router.push("/tutor/dashboard")
        } else if (userRole === "student") {
          router.push("/student/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else {
        // Fallback if no roles
        router.push("/dashboard")
      }
    } catch (error) {
      logger.error("Signup error:", error)
      dispatch({
        type: "AUTH_FAILURE",
        payload: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    }
  }

  // Logout function with improved security
  const logout = async () => {
    try {
      dispatch({ type: "AUTH_START" })
      logger.info("Logging out user")

      // First, clear all user data from browser storage
      // Do this before API call to ensure data is cleared even if API fails
      clearAllUserData()

      // Then attempt to notify the server
      const token = typeof window !== "undefined" ? localStorage.getItem("milestone-token") : null

      if (token) {
        logger.info("Attempting to logout with token")
        try {
          const response = await apiLogout()

          if (response.data) {
            logger.info("Server logout successful:", response.data.message)
            dispatch({
              type: "LOGOUT_SUCCESS",
              payload: response.data.message || "Logged out successfully.",
            })
          } else {
            logger.warn("Server logout returned no data")
            dispatch({
              type: "LOGOUT_SUCCESS",
              payload: "Logged out successfully.",
            })
          }
        } catch (apiError) {
          // If API call fails, still consider logout successful on client side
          logger.error("Server logout failed but continuing with client logout:", apiError)
          dispatch({
            type: "LOGOUT_SUCCESS",
            payload: "Logged out successfully.",
          })
        }
      } else {
        logger.info("No token found, skipping server logout")
        dispatch({
          type: "LOGOUT_SUCCESS",
          payload: "Logged out successfully.",
        })
      }

      // Use setTimeout to ensure state updates before navigation
      setTimeout(() => {
        router.push("/")
      }, 0)
    } catch (error) {
      logger.error("Logout error:", error)
      // Even if there's an error, we should still clear all user data
      clearAllUserData()
      dispatch({
        type: "LOGOUT_SUCCESS",
        payload: "Logged out successfully.",
      })

      // Use setTimeout to ensure state updates before navigation
      setTimeout(() => {
        router.push("/")
      }, 0)
    }
  }

  // Reset auth error - using useCallback to prevent recreation on each render
  const resetAuthError = useCallback(() => {
    if (state.error) {
      dispatch({ type: "AUTH_RESET" })
    }
  }, [state.error])

  // Clear success message
  const clearSuccessMessage = useCallback(() => {
    if (state.successMessage) {
      dispatch({ type: "CLEAR_SUCCESS_MESSAGE" })
    }
  }, [state.successMessage])

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: "AUTH_START" })
      logger.info("Starting auth check...")

      const token = typeof window !== "undefined" ? localStorage.getItem("milestone-token") : null

      if (!token) {
        logger.info("No token found, user is not authenticated")
        dispatch({ type: "AUTH_COMPLETE" })
        setAuthCheckComplete(true)
        return false
      }

      logger.info("Token found, validating session...")
      const authResponse = await getMe()

      if (authResponse.error || !authResponse.data) {
        logger.warn("Session validation failed:", authResponse.error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("milestone-token")
        }
        dispatch({ type: "AUTH_COMPLETE" })
        setAuthCheckComplete(true)
        return false
      }

      // Normalize user data
      const userData = normalizeUserData(authResponse.data)

      logger.info("Session validation successful, user authenticated:", userData.email)
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: userData, token },
      })
      setAuthCheckComplete(true)
      return true
    } catch (error) {
      logger.error("Auth check error:", error)
      if (typeof window !== "undefined") {
        localStorage.removeItem("milestone-token")
      }
      dispatch({
        type: "AUTH_FAILURE",
        payload: error instanceof Error ? error.message : "Authentication check failed",
      })
      setAuthCheckComplete(true)
      return false
    }
  }, [])

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      logger.info("Refreshing user data")
      const authResponse = await getMe()

      if (authResponse.error || !authResponse.data) {
        logger.warn("User refresh failed:", authResponse.error)
        return
      }

      // Normalize user data
      const userData = normalizeUserData(authResponse.data)

      logger.info("User refresh successful:", userData.email)
      dispatch({
        type: "REFRESH_USER_SUCCESS",
        payload: { user: userData },
      })
    } catch (error) {
      logger.error("User refresh error:", error)
    }
  }

  // Add setError to the contextValue in the AuthProvider component
  const contextValue = {
    ...state,
    login,
    signup,
    logout,
    resetAuthError,
    clearSuccessMessage,
    checkAuth,
    refreshUser,
    setError: (error: string) => dispatch({ type: "AUTH_FAILURE", payload: error }),
  }

  // Provide a value to indicate if the initial auth check is complete
  if (!authCheckComplete) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
