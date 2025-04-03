import type { ApiResponse } from "./types"

// Get auth token from localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("milestone-token")
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      return null
    }
  }
  return null
}

// Set auth token in localStorage
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("milestone-token", token)
    } catch (error) {
      console.error("Error setting token in localStorage:", error)
    }
  }
}

// Clear auth token from localStorage
export function clearToken(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("milestone-token")
    } catch (error) {
      console.error("Error removing token from localStorage:", error)
    }
  }
}

// Helper function to extract error message from API response
export function extractErrorMessage(responseData: any): string {
  // Check for the specific error format: {"errors":[{"message":"..."}]}
  if (responseData && responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0]
    if (firstError && firstError.message) {
      return firstError.message
    }
  }

  // Fallback to other error formats
  if (responseData && responseData.message) {
    return responseData.message
  }

  if (responseData && responseData.error) {
    return responseData.error
  }

  // Default error message
  return "An unexpected error occurred"
}

// Helper function to handle API responses
export async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const responseData = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        // Clear auth data on 401 Unauthorized
        if (typeof window !== "undefined") {
          localStorage.removeItem("milestone-token")
        }
      }

      const errorMessage = extractErrorMessage(responseData)
      return {
        error: errorMessage,
        statusCode: response.status,
      }
    }

    return { data: responseData }
  } catch (error) {
    console.error("API response handling error:", error)
    return {
      error: error instanceof Error ? `Failed to process response: ${error.message}` : "Failed to process response",
    }
  }
}

// Create headers with authentication token
export function createAuthHeaders(contentType = true): HeadersInit {
  const token = getToken()
  const headers: HeadersInit = {}

  if (contentType) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = `JWT ${token}`
  }

  return headers
}

// Enhanced mock Google authentication for development
export async function mockGoogleAuth(googleData: {
  googleId: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
}): Promise<any> {
  // This is a mock implementation for development
  // In production, this would be handled by PayloadCMS

  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
    console.log("DEV MODE: Mocking Google authentication", googleData)

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Create a mock user based on Google data
    const mockUser = {
      id: `google-${googleData.googleId}`,
      email: googleData.email,
      firstName: googleData.firstName || googleData.email.split("@")[0],
      lastName: googleData.lastName || "",
      role: "parent", // Default role for Google sign-ins
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      googleId: googleData.googleId,
      profileImage: googleData.profileImage,
    }

    // Create a mock token
    const mockToken = `mock-google-jwt-${Date.now()}`

    return {
      user: mockUser,
      token: mockToken,
    }
  }

  // For production, this would call the actual PayloadCMS endpoint
  return null
}

