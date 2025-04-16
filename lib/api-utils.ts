import type { ApiResponse } from "./types"

// Token management
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export function clearToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
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
