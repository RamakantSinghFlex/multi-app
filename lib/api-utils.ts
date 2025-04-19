/**
 * API Utilities
 *
 * This module provides utilities for API interactions, including:
 * - Token management
 * - Headers creation
 * - Error handling
 * - Response processing
 */

import type { ApiResponse } from "./types"
import { logger } from "./monitoring"

// Constants
const TOKEN_KEY = "milestone-token"
const LEGACY_TOKEN_KEY = "auth_token"

/**
 * Get the authentication token from storage
 * @returns The token or null if not found
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null

  try {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)
  } catch (error) {
    logger.error("Error retrieving token:", error)
    return null
  }
}

/**
 * Set the authentication token in storage
 * @param token The token to store
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(TOKEN_KEY, token)
    logger.info("Token stored successfully")
  } catch (error) {
    logger.error("Error storing token:", error)
  }
}

/**
 * Clear the authentication token from storage
 */
export function clearToken(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    logger.info("Auth tokens cleared successfully")
  } catch (error) {
    logger.error("Error clearing auth tokens:", error)
  }
}

/**
 * Clear all user-related data from browser storage
 * This is a comprehensive cleanup function for logout
 */
export function clearAllUserData(): void {
  if (typeof window === "undefined") return

  logger.info("Clearing all user data from browser storage")

  try {
    // Clear all known localStorage keys that might contain user data
    const userDataKeys = [
      LEGACY_TOKEN_KEY,
      TOKEN_KEY,
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
      "google_oauth_state",
      "google_user_info",
    ]

    userDataKeys.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        logger.error(`Failed to remove ${key} from localStorage:`, e)
      }
    })

    // As a fallback, try to clear all localStorage
    try {
      localStorage.clear()
    } catch (e) {
      logger.error("Failed to clear localStorage:", e)
    }

    // Clear session storage
    try {
      sessionStorage.clear()
    } catch (e) {
      logger.error("Failed to clear sessionStorage:", e)
    }

    // Clear cookies (those accessible via JavaScript)
    try {
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
    } catch (e) {
      logger.error("Failed to clear cookies:", e)
    }

    logger.info("All user data cleared successfully")
  } catch (error) {
    logger.error("Error during data clearing:", error)
  }
}

/**
 * Create headers for API requests, including authentication if available
 * @param includeContentType Whether to include Content-Type header
 * @returns Headers object for fetch requests
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
 * Extract a human-readable error message from various error formats
 * @param errorData Error data from API response
 * @returns Formatted error message
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
 * Process API responses and standardize the format
 * @param response Fetch Response object
 * @returns Standardized ApiResponse object
 */
export async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    try {
      const errorData = await response.json()
      const errorMessage = extractErrorMessage(errorData)
      logger.error(`API error (${response.status}):`, errorMessage)
      return { error: errorMessage }
    } catch (error) {
      const errorMessage = `Error: ${response.status} ${response.statusText}`
      logger.error(errorMessage)
      return { error: errorMessage }
    }
  }

  try {
    const data = await response.json()
    return { data: data.user ? data.user : data }
  } catch (error) {
    logger.error("Failed to parse response data:", error)
    return { error: "Failed to parse response data" }
  }
}

/**
 * Helper function to standardize API response handling
 * @param param0 Object containing data or error
 * @returns Standardized ApiResponse object
 */
export function handleApiResponse<T>({ data, error }: { data?: T; error?: string }): ApiResponse<T> {
  if (error) {
    logger.error("API error:", error)
    return { error }
  }
  if (data) {
    return { data }
  }
  const errorMessage = "No data or error provided"
  logger.error(errorMessage)
  return { error: errorMessage }
}

/**
 * Safely parse JSON with error handling
 * @param jsonString JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    logger.error("JSON parse error:", error)
    return fallback
  }
}
