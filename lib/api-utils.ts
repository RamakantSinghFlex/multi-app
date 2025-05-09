/**
 * API Utilities
 *
 * This module provides utilities for API interactions, including:
 * - Token management
 * - Headers creation
 * - Error handling
 * - Response processing
 */

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
export async function handleResponse<T>(response: Response): Promise<{ data?: T; error?: string }> {
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
    return { data: data.user || data }
  } catch (error) {
    logger.error("Failed to parse response data:", error)
    return { error: "Failed to parse response data" }
  }
}

// Export types
export type ApiResponse<T> = {
  data?: T
  error?: string
}
