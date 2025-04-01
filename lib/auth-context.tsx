"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useReducer } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials, SignupCredentials, User } from "./types"
import { getMe, login as apiLogin, logout as apiLogout, signup as apiSignup } from "./api"

// Initial auth state
const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
}

// Auth action types
type AuthAction =
    | {type: "AUTH_START"}
    | {type: "AUTH_SUCCESS"; payload: {user: User; token?: string}}
    | {type: "AUTH_FAILURE"; payload: string}
    | {type: "AUTH_RESET"}
    | {type: "LOGOUT"}

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "AUTH_START":
            return {
                ...state,
                isLoading: true,
                error: null,
            }
        case "AUTH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token || state.token,
                error: null,
            }
        case "AUTH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                error: action.payload,
            }
        case "AUTH_RESET":
            return {
                ...state,
                error: null,
            }
        case "LOGOUT":
            return {
                ...initialState,
                isLoading: false,
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
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
    ...initialState,
    login: async () => {
    },
    signup: async () => {
    },
    logout: async () => {
    },
    resetAuthError: () => {
    },
})

// Auth provider component
export function AuthProvider({ children }: {children: React.ReactNode}) {
    const [state, dispatch] = useReducer(authReducer, initialState)
    const router = useRouter()

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            dispatch({ type: "AUTH_START" })

            const token = localStorage.getItem("milestone-token")

            if (!token) {
                dispatch({ type: "LOGOUT" })
                return
            }

            const authResponse = await getMe()

            if (authResponse.error || !authResponse.data) {
                localStorage.removeItem("milestone-token")
                dispatch({ type: "LOGOUT" })
                return
            }

            dispatch({
                type: "AUTH_SUCCESS",
                payload: { user: authResponse.data, token },
            })
        }

        checkAuth()
    }, [])

    // Login function
    const login = async (credentials: LoginCredentials) => {
        dispatch({ type: "AUTH_START" })

        try {
            console.log("Attempting login with:", credentials)
            const response = await apiLogin(credentials)

            if (response.error || !response.data) {
                console.error("Login failed:", response.error)
                dispatch({
                    type: "AUTH_FAILURE",
                    payload: response.error || "Login failed. Please try again.",
                })
                return
            }

            console.log("Login successful:", response.data)

            // Ensure token is stored in localStorage
            if (response.data.token) {
                localStorage.setItem("milestone-token", response.data.token)
            }

            dispatch({
                type: "AUTH_SUCCESS",
                payload: {
                    user: response.data.user,
                    token: response.data.token,
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
            console.error("Login error:", error)
            dispatch({
                type: "AUTH_FAILURE",
                payload: error instanceof Error ? error.message : "An unexpected error occurred",
            })
        }
    }

    // Update the signup function in the auth context to handle the nested response
    const signup = async (credentials: SignupCredentials) => {
        dispatch({ type: "AUTH_START" })

        try {
            const response = await apiSignup(credentials)

            if (response.error || !response.data) {
                dispatch({
                    type: "AUTH_FAILURE",
                    payload: response.error || "Signup failed. Please try again.",
                })
                return
            }

            // Store token if available
            if (response.data.token) {
                localStorage.setItem("milestone-token", response.data.token)
            }

            dispatch({
                type: "AUTH_SUCCESS",
                payload: {
                    user: response.data.user,
                    token: response.data.token,
                },
            })

            // Redirect based on user role
            router.push("/login")

        } catch (error) {
            console.error("Signup error:", error)
            dispatch({
                type: "AUTH_FAILURE",
                payload: error instanceof Error ? error.message : "An unexpected error occurred",
            })
        }
    }

    // Logout function
    const logout = async () => {
        dispatch({ type: "AUTH_START" })

        await apiLogout()

        dispatch({ type: "LOGOUT" })
        router.push("/login")
    }

    // Reset auth error - using useCallback to prevent recreation on each render
    const resetAuthError = useCallback(() => {
        if (state.error) {
            dispatch({ type: "AUTH_RESET" })
        }
    }, [state.error])

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                signup,
                logout,
                resetAuthError,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Auth hook
export const useAuth = () => useContext(AuthContext)

