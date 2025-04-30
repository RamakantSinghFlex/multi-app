/**
 * API Client
 *
 * This module provides functions for interacting with the backend API.
 * It includes authentication, user management, and other API operations.
 */

import {
  setToken,
  clearToken,
  createAuthHeaders,
  extractErrorMessage,
  handleResponse,
  type ApiResponse,
} from "./api-utils"
import type { AuthResponse, LoginCredentials, User, SignupCredentials } from "./types"
import { API_URL, FEATURES, DEV_CONFIG, TENANT_NAME } from "./config"
import { logger, trackAsyncPerformance } from "./monitoring"

/**
 * Add artificial delay for development testing
 */
async function addDevDelay(): Promise<void> {
  if (FEATURES.MOCK_API && DEV_CONFIG.SIMULATE_SLOW_API) {
    await new Promise((resolve) => setTimeout(resolve, DEV_CONFIG.SLOW_API_DELAY))
  }
}

/**
 * Login user with email and password
 * @param credentials User credentials
 * @returns API response with auth data or error
 */
export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  return trackAsyncPerformance("login", async () => {
    try {
      logger.info("API login called with:", { email: credentials.email })

      // For development/testing, simulate a successful login
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful login")
        await addDevDelay()

        // Create a mock response
        const mockResponse: AuthResponse = {
          user: {
            id: "123",
            email: credentials.email,
            firstName: "Test",
            lastName: "User",
            roles: ["parent"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: "mock-jwt-token",
        }

        // Store the token
        setToken(mockResponse.token)

        logger.info("DEV MODE: Returning mock response")
        return { data: mockResponse }
      }

      // Actual API call for production
      logger.info("Making API request to:", `${API_URL}/users/login`)

      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      })

      logger.info("API response status:", response.status)

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = extractErrorMessage(errorData)
        logger.error("Login failed:", errorMessage)
        return {
          error: errorMessage,
        }
      }

      const result = await response.json()
      logger.info("API response processed successfully")

      if (result.token) {
        logger.info("Setting token in localStorage")
        setToken(result.token)
      }

      return { data: result }
    } catch (error) {
      logger.error("Login API error:", error)
      return {
        error: error instanceof Error ? error.message : "An unknown error occurred during login",
      }
    }
  })
}

/**
 * Request password reset for a user
 * @param email User email
 * @returns API response with message or error
 */
export async function forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
  return trackAsyncPerformance("forgotPassword", async () => {
    try {
      logger.info("Forgot password request for email:", email)

      // For development/testing, simulate a successful response
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful forgot password request")
        await addDevDelay()

        return {
          data: {
            message: "If a user with that email exists, a password reset link has been sent to their inbox.",
          },
        }
      }

      // Actual API call for production
      logger.info("Making API request to:", `${API_URL}/users/forgot-password`)

      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      })

      logger.info("Forgot password response status:", response.status)

      // For security reasons, we don't want to reveal if an email exists or not
      // So we return a success message even if there was an error
      if (!response.ok) {
        logger.warn("Forgot password request failed, but returning generic success message for security")
        return {
          data: {
            message: "If a user with that email exists, a password reset link has been sent to their inbox.",
          },
        }
      }

      const result = await response.json()
      return { data: result }
    } catch (error) {
      logger.error("Forgot password API error:", error)

      // For security reasons, return a success message even if there was an error
      return {
        data: {
          message: "If a user with that email exists, a password reset link has been sent to their inbox.",
        },
      }
    }
  })
}

/**
 * Reset user password with token
 * @param token Reset token
 * @param password New password
 * @returns API response with message or error
 */
export async function resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
  return trackAsyncPerformance("resetPassword", async () => {
    try {
      logger.info("Reset password request with token")

      // For development/testing, simulate a successful response
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful password reset")
        await addDevDelay()

        return {
          data: {
            message: "Password successfully reset. You can now log in with your new password.",
          },
        }
      }

      // Actual API call for production
      logger.info("Making API request to:", `${API_URL}/users/reset-password`)

      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      })

      logger.info("Reset password response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = extractErrorMessage(errorData)
        logger.error("Reset password request failed:", errorMessage)
        return {
          error: errorMessage,
        }
      }

      const result = await response.json()
      return { data: result }
    } catch (error) {
      logger.error("Reset password API error:", error)
      return {
        error: error instanceof Error ? error.message : "An unknown error occurred while resetting your password",
      }
    }
  })
}

/**
 * Logout current user
 * @returns API response with success status or error
 */
export async function logout(): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  return trackAsyncPerformance("logout", async () => {
    try {
      const headers = createAuthHeaders()
      logger.info("Logging out with headers")

      // Clear token first to ensure user is logged out even if API call fails
      clearToken()

      // For development/testing, simulate a successful response
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful logout")
        await addDevDelay()

        return {
          data: {
            success: true,
            message: "Logged out successfully",
          },
        }
      }

      const response = await fetch(`${API_URL}/users/logout`, {
        method: "POST",
        headers,
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = extractErrorMessage(errorData)
        logger.warn("Logout API call failed:", errorMessage)
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
      logger.error("Logout error:", error)
      return {
        error: error instanceof Error ? error.message : "An unknown error occurred during logout",
        data: { success: true }, // Consider logout successful even if API call fails
      }
    }
  })
}

/**
 * Get current user data
 * @returns API response with user data or error
 */
export async function getMe(): Promise<ApiResponse<User>> {
  return trackAsyncPerformance("getMe", async () => {
    try {
      const headers = createAuthHeaders(false)

      if (!headers.Authorization) {
        logger.info("No token found, user is not authenticated")
        return { error: "Not authenticated" }
      }

      logger.info("Validating session with token")

      // For development/testing without an API
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful session validation")
        await addDevDelay()

        // Create a mock user
        const mockUser: User = {
          id: "123",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          roles: ["parent"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return { data: mockUser }
      }

      logger.info("Making API request to validate session:", `${API_URL}/users/me`)

      const response = await fetch(`${API_URL}/users/me`, {
        headers,
        credentials: "include",
      })

      logger.info("Session validation response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = extractErrorMessage(errorData)
        logger.warn("Session validation failed:", errorMessage)
        return {
          error: errorMessage,
        }
      }

      const userData = await response.json()
      return { data: userData.user }
    } catch (error) {
      logger.error("Session validation error:", error)
      return {
        error: error instanceof Error ? error.message : "An unknown error occurred while fetching user data",
      }
    }
  })
}

/**
 * Create new user (signup)
 * @param credentials User signup data
 * @returns API response with auth data or error
 */
export async function signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
  return trackAsyncPerformance("signup", async () => {
    try {
      credentials.tenantName = TENANT_NAME

      // Ensure roles is an array
      if (credentials.role && !credentials.roles) {
        credentials.roles = [credentials.role]
      } else if (!credentials.roles) {
        credentials.roles = ["user"]
      }

      // For development/testing, simulate a successful response
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful signup")
        await addDevDelay()

        // Create a mock response
        const mockResponse: AuthResponse = {
          user: {
            id: String(Date.now()),
            email: credentials.email,
            firstName: credentials.firstName || "",
            lastName: credentials.lastName || "",
            roles: credentials.roles,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: "mock-jwt-token-signup",
          message: "Account created successfully!",
        }

        // Store the token
        if (mockResponse.token) {
          setToken(mockResponse.token)
        }

        return { data: mockResponse }
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      })

      const result = await handleResponse<{ doc: User; message: string }>(response)

      // If signup was successful, automatically log the user in
      if (result.data?.doc && !result.error) {
        const loginCredentials: LoginCredentials = {
          email: credentials.email,
          password: credentials.password,
        }

        // Call login API with the same credentials
        const loginResponse = await login(loginCredentials)

        if (loginResponse.data) {
          // Return the login response with the signup success message
          return {
            data: {
              ...loginResponse.data,
              message: result.data.message || "User successfully created and logged in.",
            },
          }
        }

        // If login fails, still return the signup success
        return {
          data: {
            user: result.data.doc,
            token: "",
            message: result.data.message || "User successfully created.",
          },
        }
      }

      // If there's no doc in the response but no error either, return an error
      if (!result.error) {
        return {
          error: "Invalid response format from server",
        }
      }

      return result
    } catch (error) {
      logger.error("Signup error:", error)
      return {
        error: error instanceof Error ? error.message : "An unknown error occurred during signup",
      }
    }
  })
}

/**
 * Get user sessions
 * @returns A response containing the sessions data
 */
export async function getSessions(): Promise<ApiResponse<{ sessions: any[] }>> {
  try {
    const response = await fetch(`${API_URL}/api/sessions`, {
      method: "GET",
      headers: createAuthHeaders(),
      credentials: "include",
    })

    return await handleResponse<{ sessions: any[] }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching sessions",
    }
  }
}

// Export types
export type { User }
