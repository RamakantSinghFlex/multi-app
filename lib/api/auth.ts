import { setToken, clearToken, createAuthHeaders, extractErrorMessage } from "../api-utils"
import type { ApiResponse, AuthResponse, LoginCredentials, User } from "../types"
import { API_URL } from "../config"

// Login
export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  try {
    console.log("API login called with:", credentials)

    // For development/testing, simulate a successful login with proper logging
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log("DEV MODE: Simulating successful login")

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockResponse: AuthResponse = {
        user: {
          id: "123",
          email: credentials.email,
          firstName: "Test",
          lastName: "User",
          role: "parent",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: "mock-jwt-token",
      }

      // Store the token
      setToken(mockResponse.token)

      console.log("DEV MODE: Returning mock response:", mockResponse)

      return {
        data: mockResponse,
      }
    }

    // Actual API call for production or when API URL is configured
    console.log("Making API request to:", `${API_URL}/users/login`)

    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    })

    console.log("API response status:", response.status)

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = extractErrorMessage(errorData)
      console.error("Login failed:", errorMessage)
      return {
        error: errorMessage,
      }
    }

    const result = await response.json()
    console.log("API response processed:", result)

    if (result.token) {
      console.log("Setting token in localStorage")
      setToken(result.token)
    }

    return { data: result }
  } catch (error) {
    console.error("Login API error:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during login",
    }
  }
}

// Forgot Password
export async function forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
  try {
    console.log("Forgot password request for email:", email)

    // For development/testing, simulate a successful response
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log("DEV MODE: Simulating successful forgot password request")

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return {
        data: {
          message: "If a user with that email exists, a password reset link has been sent to their inbox.",
        },
      }
    }

    // Actual API call for production
    console.log("Making API request to:", `${API_URL}/users/forgot-password`)

    const response = await fetch(`${API_URL}/users/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    })

    console.log("Forgot password response status:", response.status)

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = extractErrorMessage(errorData)
      console.error("Forgot password request failed:", errorMessage)

      // For security reasons, we don't want to reveal if an email exists or not
      // So we return a success message even if there was an error
      return {
        data: {
          message: "If a user with that email exists, a password reset link has been sent to their inbox.",
        },
      }
    }

    const result = await response.json()
    return { data: result }
  } catch (error) {
    console.error("Forgot password API error:", error)

    // For security reasons, return a success message even if there was an error
    return {
      data: {
        message: "If a user with that email exists, a password reset link has been sent to their inbox.",
      },
    }
  }
}

// Reset Password
export async function resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
  try {
    console.log("Reset password request with token")

    // For development/testing, simulate a successful response
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log("DEV MODE: Simulating successful password reset")

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return {
        data: {
          message: "Password successfully reset. You can now log in with your new password.",
        },
      }
    }

    // Actual API call for production
    console.log("Making API request to:", `${API_URL}/users/reset-password`)

    const response = await fetch(`${API_URL}/users/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
      credentials: "include",
    })

    console.log("Reset password response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = extractErrorMessage(errorData)
      console.error("Reset password request failed:", errorMessage)
      return {
        error: errorMessage,
      }
    }

    const result = await response.json()
    return { data: result }
  } catch (error) {
    console.error("Reset password API error:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while resetting your password",
    }
  }
}

// Logout
export async function logout(): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const headers = createAuthHeaders()

    console.log("Logging out with headers:", headers)

    const response = await fetch(`${API_URL}/users/logout`, {
      method: "POST",
      headers,
      credentials: "include",
    })

    clearToken()

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = extractErrorMessage(errorData)
      return {
        error: errorMessage,
        data: { success: true }, // Consider logout successful even if API call fails
      }
    }

    const result = await response.json()
    return {
      data: {
        success: true,
        ...result,
      },
    }
  } catch (error) {
    console.error("Logout error:", error)
    clearToken()
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during logout",
      data: { success: true }, // Consider logout successful even if API call fails
    }
  }
}

// Get current user
export async function getMe(): Promise<ApiResponse<User>> {
  try {
    const headers = createAuthHeaders(false)

    if (!headers.Authorization) {
      console.log("No token found, user is not authenticated")
      return { error: "Not authenticated" }
    }

    console.log("Validating session with token")

    // For development/testing without an API
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log("DEV MODE: Simulating successful session validation")

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 300))

      const mockUser: User = {
        id: "123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "parent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return { data: mockUser }
    }

    console.log("Making API request to validate session:", `${API_URL}/users/me`)

    const response = await fetch(`${API_URL}/users/me`, {
      headers,
      credentials: "include",
    })

    console.log("Session validation response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = extractErrorMessage(errorData)
      return {
        error: errorMessage,
      }
    }

    const userData = await response.json()
    return { data: userData }
  } catch (error) {
    console.error("Session validation error:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching user data",
    }
  }
}

// Google Sign-In
export async function googleSignIn(): Promise<void> {
  try {
    // Redirect to our Google OAuth endpoint
    window.location.href = "/api/auth/google"
  } catch (error) {
    console.error("Google sign-in error:", error)
    throw error
  }
}

