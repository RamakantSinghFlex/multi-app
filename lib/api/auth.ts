import type { ApiResponse, User } from "../types"
import { API_URL } from "../config"
import { login, forgotPassword, resetPassword, logout, getMe } from "../api"

// Re-export the functions from the main API module
export { login, forgotPassword, resetPassword, logout, getMe }

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
