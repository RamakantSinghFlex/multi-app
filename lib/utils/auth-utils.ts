/**
 * Utility functions for authentication and user management
 */

// Clear all user-related data from browser storage
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
