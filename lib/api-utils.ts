import type { ApiResponse } from "./types"

// Token management
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("milestone-token") || localStorage.getItem("auth_token")
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("milestone-token", token)
}

// Add a comprehensive token clearing function
export function clearToken(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("milestone-token")
    console.log("Auth tokens cleared successfully")
  } catch (error) {
    console.error("Error clearing auth tokens:", error)
  }
}

// Add a new function to clear all user-related data
export function clearAllUserData(): void {
  if (typeof window === "undefined") return

  console.log("Clearing all user data from browser storage")

  try {
    // Clear all known localStorage keys that might contain user data
    const userDataKeys = [
      "auth_token",
      "milestone-token",
      "recentlyCreatedStudents",
      "user-preferences",
      "recent-searches",
      "dashboard-settings",
      "saved-filters",
      "recent-documents",
      "message-drafts",
      "user",
      "userRole",
      "userPreferences",
      "lastLogin",
      "sessionData",
      "authState",
      "rememberMe",
    ]

    userDataKeys.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error(`Failed to remove ${key} from localStorage:`, e)
      }
    })

    // As a fallback, try to clear all localStorage
    try {
      localStorage.clear()
    } catch (e) {
      console.error("Failed to clear localStorage:", e)
    }

    // Clear session storage
    try {
      sessionStorage.clear()
    } catch (e) {
      console.error("Failed to clear sessionStorage:", e)
    }

    // Clear cookies (those accessible via JavaScript)
    try {
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
    } catch (e) {
      console.error("Failed to clear cookies:", e)
    }

    console.log("All user data cleared successfully")
  } catch (error) {
    console.error("Error clearing user data:", error)
  }
}

// Headers creation
export function createAuthHeaders(includeContentType = true): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = getToken()

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }

  return headers
}

// Error handling
export function extractErrorMessage(errorData: any): string {
  if (typeof errorData === "string") return errorData

  if (errorData.message) return errorData.message
  if (errorData.error) return typeof errorData.error === "string" ? errorData.error : JSON.stringify(errorData.error)
  if (errorData.errors && Array.isArray(errorData.errors)) {
    return errorData.errors.map((e: any) => e.message || e).join(", ")
  }

  return "An unknown error occurred"
}

// Response handling
export async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    try {
      const errorData = await response.json()
      const errorMessage = extractErrorMessage(errorData)
      return { error: errorMessage }
    } catch (error) {
      return { error: `Error: ${response.status} ${response.statusText}` }
    }
  }

  try {
    const data = await response.json()
    return { data: data.doc }
  } catch (error) {
    return { error: "Failed to parse response data" }
  }
}

// API response helper
export function handleApiResponse<T>({ data, error }: { data?: T; error?: string }): ApiResponse<T> {
  if (error) {
    return { error }
  }
  if (data) {
    return { data }
  }
  return { error: "No data or error provided" }
}
