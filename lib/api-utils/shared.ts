import type { ApiResponse } from "@/lib/types"

/**
 * Generic function to handle API responses
 */
export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
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
    return { data: data.user || data }
  } catch (error) {
    return { error: "Failed to parse response data" }
  }
}

/**
 * Extract error message from error data
 */
export function extractErrorMessage(errorData: any): string {
  if (typeof errorData === "string") return errorData

  if (errorData.message) return errorData.message
  if (errorData.error) return typeof errorData.error === "string" ? errorData.error : JSON.stringify(errorData.error)
  if (errorData.errors && Array.isArray(errorData.errors)) {
    return errorData.errors.map((e: any) => e.message || e).join(", ")
  }

  return "An unknown error occurred"
}

/**
 * Create authentication headers
 */
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

/**
 * Get authentication token from storage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("milestone-token") || localStorage.getItem("auth_token")
}

/**
 * Set authentication token in storage
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("milestone-token", token)
}

/**
 * Clear authentication token from storage
 */
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
