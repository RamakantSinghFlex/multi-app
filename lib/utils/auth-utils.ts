/**
 * Utility functions for authentication and user management
 */

import { clearAllUserData } from "./clear-user-data"
import { logger } from "../monitoring"

/**
 * Handle logout with proper cleanup
 * @param logoutFunction Function to call for server-side logout
 * @returns Promise that resolves when logout is complete
 */
export async function handleLogout(logoutFunction: () => Promise<void>): Promise<void> {
  try {
    logger.info("Starting logout process")

    // First clear all local data
    clearAllUserData()
    logger.info("Local user data cleared")

    // Then call the logout function
    try {
      await logoutFunction()
      logger.info("Server logout completed successfully")
    } catch (error) {
      logger.error("Server logout failed, but continuing with client logout", error)
    }
  } catch (error) {
    logger.error("Error during logout:", error)

    // Force navigation to home page if logout fails
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }
}
