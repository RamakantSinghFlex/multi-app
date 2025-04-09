import { API_URL } from "./config"

// Define ApiResponse type
export type ApiResponse<T> = {
  data?: T
  error?: string
  statusCode?: number
}

// Set token in localStorage
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("milestone-token", token)
  }
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("milestone-token")
  }
  return null
}

// Clear token from localStorage
export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("milestone-token")
  }
}

// Create headers with Authorization token
export function createAuthHeaders(includeContentType = true): Record<string, string> {
  const headers: Record<string, string> = {}

  if (includeContentType) {
    headers["Content-Type"] = "application/json"
  }

  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

// Extract error message from API response
export function extractErrorMessage(errorData: any): string {
  if (typeof errorData === "string") {
    return errorData
  }

  if (errorData.message) {
    return errorData.message
  }

  if (errorData.error) {
    if (typeof errorData.error === "string") {
      return errorData.error
    }
    if (errorData.error.message) {
      return errorData.error.message
    }
  }

  if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
    const firstError = errorData.errors[0]
    if (typeof firstError === "string") {
      return firstError
    }
    if (firstError.message) {
      return firstError.message
    }
  }

  return "An unknown error occurred"
}

// Helper function to handle API responses
export async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth data on 401 Unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("milestone-token")
      }
    }

    try {
      const errorData = await response.json()
      return {
        error: errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
      }
    } catch (e) {
      return {
        error: `Error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
      }
    }
  }

  try {
    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: "Failed to parse response" }
  }
}

// Format API URL
export function formatApiUrl(endpoint: string): string {
  return `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
}

// Sanitize HTML to prevent XSS attacks
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  // Basic sanitization - remove script tags and on* attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/on\w+=\w+/gi, "")
}
