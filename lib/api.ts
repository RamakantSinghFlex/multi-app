import {
  setToken,
  clearToken,
  createAuthHeaders,
  extractErrorMessage,
  handleResponse,
  type ApiResponse,
} from "./api-utils"
import type { AuthResponse, LoginCredentials, User } from "./types"
import { API_URL } from "./config"
import type { SignupCredentials } from "./types"
import { ObjectId } from "bson"

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
          roles: ["parent"], // Changed from role: "parent" to roles: ["parent"]
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
    return { data: userData.user }
  } catch (error) {
    console.error("Session validation error:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching user data",
    }
  }
}

// Create user (signup)
export async function signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
  try {
    credentials.tenantName = 'Tenant 1';

    // Ensure roles is an array
    if (credentials.role && !credentials.roles) {
      credentials.roles = [credentials.role]
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
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during signup",
    }
  }
}

// Create user (admin)
export async function createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(userData),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating user",
    }
  }
}

// Update user
export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating user with ID ${id}`,
    }
  }
}

// Delete user
export async function deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<{ success: boolean }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while deleting user with ID ${id}`,
    }
  }
}

// Create appointment
export async function createAppointment(data: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating appointment",
    }
  }
}

// Update appointment
export async function updateAppointment(id: string, data: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while updating appointment with ID ${id}`,
    }
  }
}

// Cancel appointment
export async function cancelAppointment(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify({ status: "cancelled" }),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while cancelling appointment with ID ${id}`,
    }
  }
}

// Register user
export async function register(userData: any): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        error: errorData.message || `Error: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during registration",
    }
  }
}

// Get content by collection
export async function getContentByCollection(collection: string): Promise<ApiResponse<any[]>> {
  try {
    const headers = createAuthHeaders(false)

    // For development/testing without an API
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log(`DEV MODE: Simulating content fetch for collection: ${collection}`)

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 300))

      return {
        data: [
          { id: "1", title: "Sample Content 1", description: "This is sample content for development" },
          { id: "2", title: "Sample Content 2", description: "More sample content for testing" },
        ],
      }
    }

    const response = await fetch(`${API_URL}/${collection}`, {
      headers,
      credentials: "include",
    })

    return await handleResponse<any[]>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while fetching content from collection ${collection}`,
    }
  }
}

// Get content by ID
export async function getContentById(collection: string, id: string): Promise<ApiResponse<any>> {
  try {
    const headers = createAuthHeaders(false)

    // For development/testing without an API
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log(`DEV MODE: Simulating content fetch for ${collection} with ID: ${id}`)

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 300))

      return {
        data: {
          id,
          title: "Sample Content Item",
          description: "This is a sample content item for development",
          content: "<p>This is the full content of the sample item.</p>",
        },
      }
    }

    const response = await fetch(`${API_URL}/${collection}/${id}`, {
      headers,
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while fetching ${collection} with ID ${id}`,
    }
  }
}

// Get sessions
export async function getSessions(params?: Record<string, string>): Promise<ApiResponse<any[]>> {
  try {
    const headers = createAuthHeaders()

    // Build query string from params
    const queryString = params ? "?" + new URLSearchParams(params).toString() : ""

    // For development/testing without an API
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log(`DEV MODE: Simulating sessions fetch with params: ${queryString}`)

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 300))

      return {
        data: [
          {
            id: "1",
            title: "Math Session",
            date: new Date().toISOString(),
            duration: 60,
            status: "completed",
          },
          {
            id: "2",
            title: "Science Session",
            date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
            duration: 45,
            status: "scheduled",
          },
        ],
      }
    }

    const response = await fetch(`${API_URL}/sessions${queryString}`, {
      headers,
      credentials: "include",
    })

    return await handleResponse<any[]>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching sessions",
    }
  }
}

export type { User }
