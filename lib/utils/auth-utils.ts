/**
 * Utility functions for authentication and user management
 */

import { clearAllUserData } from "./clear-user-data"

// Handle logout with proper cleanup
export async function handleLogout(logoutFunction: () => Promise<void>): Promise<void> {
  try {
    // First clear all local data
    clearAllUserData()

    // Then call the logout function
    await logoutFunction()
  } catch (error) {
    console.error("Error during logout:", error)
    // Force navigation to home page if logout fails
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }
}
