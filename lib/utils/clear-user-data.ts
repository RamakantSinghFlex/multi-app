/**
 * Utility function to clear all user-related data from the browser
 * This ensures a complete logout with no residual user data
 */
export function clearAllUserData() {
  try {
    // Clear specific known localStorage items
    const knownKeys = [
      "milestone-token",
      "recentlyCreatedStudents",
      "user",
      "userRole",
      "userPreferences",
      "lastLogin",
      "sessionData",
      "authState",
      "rememberMe",
    ]

    knownKeys.forEach((key) => {
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

    // Clear sessionStorage as well
    try {
      sessionStorage.clear()
    } catch (e) {
      console.error("Failed to clear sessionStorage:", e)
    }

    // Clear all cookies
    try {
      const cookies = document.cookie.split(";")

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      }
    } catch (e) {
      console.error("Failed to clear cookies:", e)
    }

    console.log("All user data cleared successfully")
    return true
  } catch (error) {
    console.error("Error clearing user data:", error)
    return false
  }
}

/**
 * Utility function to clear specific user data
 * @param keys - Array of localStorage keys to clear
 */
export function clearSpecificUserData(keys: string[]) {
  try {
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (e) {
        console.error(`Failed to remove ${key} from localStorage:`, e)
      }
    })
    return true
  } catch (error) {
    console.error("Error clearing specific user data:", error)
    return false
  }
}
