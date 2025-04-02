"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials, SignupCredentials, User } from "./types"
import { getMe, login as apiLogin, logout as apiLogout, signup as apiSignup } from "./api"
import { logger } from "./monitoring"

// Initial auth state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  successMessage: null,
}

// Auth action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token?: string; message?: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_RESET" }
  | { type: "AUTH_COMPLETE" } // New action to mark auth check as complete even if not authenticated
  | { type: "LOGOUT_SUCCESS"; payload: string }
  | { type: "CLEAR_SUCCESS_MESSAGE" }

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
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
    default:
      return state
  }
}

// Auth context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => Promise<void>
  resetAuthError: () => void
  clearSuccessMessage: () => void
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetAuthError: () => {},
  clearSuccessMessage: () => {},
})

// Auth provider component
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

        const token = localStorage.getItem("milestone-token")

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
          localStorage.removeItem("milestone-token")
          dispatch({ type: "AUTH_COMPLETE" })
          setAuthCheckComplete(true)
          return
        }

        logger.info("Session validation successful, user authenticated:", authResponse.data.email)
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: authResponse.data, token },
        })
        setAuthCheckComplete(true)
      } catch (error) {
        logger.error("Auth check error:", error)
        localStorage.removeItem("milestone-token")
        dispatch({
          type: "AUTH_FAILURE",
          payload: error instanceof Error ? error.message : "Authentication check failed",
        })
        setAuthCheckComplete(true)
      }
    }

    checkAuth()
  }, [])

  // Login function
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
      if (response.data.token) {
        localStorage.setItem("milestone-token", response.data.token)
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
          message: response.data.message || "Login successful!",
        },
      })

      // Redirect based on user role
      if (response.data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (response.data.user.role === "parent") {
        router.push("/parent/dashboard")
      } else if (response.data.user.role === "tutor") {
        router.push("/tutor/dashboard")
      } else if (response.data.user.role === "student") {
        router.push("/student/dashboard")
      } else {
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

  // Update the signup function to handle success message
  const signup = async (credentials: SignupCredentials) => {
    dispatch({ type: "AUTH_START" })

    try {
      logger.info("Attempting signup with:", { email: credentials.email })
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

      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
          message: response.data.message || "Account created successfully!",
        },
      })

      // Redirect based on user role
      if (response.data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (response.data.user.role === "parent") {
        router.push("/parent/dashboard")
      } else if (response.data.user.role === "tutor") {
        router.push("/tutor/dashboard")
      } else if (response.data.user.role === "student") {
        router.push("/student/dashboard")
      } else {
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

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: "AUTH_START" })
      logger.info("Logging out user")

      const token = localStorage.getItem("milestone-token")
      if (token) {
        logger.info("Attempting to logout with token")
        const response = await apiLogout()

        // Always clear local storage and update state
        localStorage.removeItem("milestone-token")

        if (response.data) {
          dispatch({
            type: "LOGOUT_SUCCESS",
            payload: response.data.message || "Logged out successfully.",
          })
        } else {
          dispatch({
            type: "LOGOUT_SUCCESS",
            payload: "Logged out successfully.",
          })
        }
      } else {
        localStorage.removeItem("milestone-token")
        dispatch({
          type: "LOGOUT_SUCCESS",
          payload: "Logged out successfully.",
        })
      }

      router.push("/")
    } catch (error) {
      logger.error("Logout error:", error)
      // Even if there's an error, we should still clear the local state
      localStorage.removeItem("milestone-token")
      dispatch({
        type: "LOGOUT_SUCCESS",
        payload: "Logged out successfully.",
      })
      router.push("/")
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

  // Provide a value to indicate if the initial auth check is complete
  const contextValue = {
    ...state,
    login,
    signup,
    logout,
    resetAuthError,
    clearSuccessMessage,
  }

  // Show a loading indicator while the initial auth check is in progress
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
export const useAuth = () => useContext(AuthContext)

