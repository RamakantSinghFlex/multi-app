/**
 * Comprehensive helper for handling logout across the application
 * This ensures consistent logout behavior everywhere
 */
import { clearAllUserData } from "./clear-user-data"
import { logger } from "../monitoring"

export async function handleLogout(logoutFunction: () => Promise<void>, onComplete?: () => void): Promise<void> {
  try {
    logger.info("Starting logout process")

    // First clear all browser data to ensure clean state
    // even if the API call fails
    clearAllUserData()
    logger.info("Local data cleared")

    // Then attempt to call the API logout
    try {
      await logoutFunction()
      logger.info("Server logout successful")
    } catch (apiError) {
      logger.error("Server logout failed, but continuing with client logout", apiError)
    }

    // Execute any additional cleanup
    if (onComplete) {
      onComplete()
    }

    // Force navigation to home page
    // This is a fallback in case the router navigation in auth context fails
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }, 100)
  } catch (error) {
    logger.error("Critical error during logout:", error)

    // Force navigation even if everything else fails
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }

    // Execute completion callback even on error
    if (onComplete) {
      onComplete()
    }
  }
}
