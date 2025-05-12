import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, Message, Conversation } from "../types"
import { API_URL } from "../config"

// Get messages for a conversation
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50
): Promise<ApiResponse<Message[]>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(
      `${API_URL}/conversations/${conversationId}/messages?${queryString}`,
      {
        headers: createAuthHeaders(false),
        credentials: "include",
      }
    )

    return await handleResponse<Message[]>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching messages",
    }
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  content: string,
  isSensitive = false
): Promise<ApiResponse<Message>> {
  try {
    const response = await fetch(
      `${API_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: createAuthHeaders(),
        body: JSON.stringify({ content, isSensitive }),
        credentials: "include",
      }
    )

    return await handleResponse<Message>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while sending message",
    }
  }
}

// Delete a message
export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(
      `${API_URL}/conversations/${conversationId}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: createAuthHeaders(false),
        credentials: "include",
      }
    )

    return await handleResponse<{ success: boolean }>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while deleting message with ID ${messageId}`,
    }
  }
}

// Get conversations
export async function getConversations(
  page = 1,
  limit = 10
): Promise<ApiResponse<Conversation[]>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/conversations?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Conversation[]>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching conversations",
    }
  }
}

// Get conversation by ID
export async function getConversation(
  id: string
): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Conversation>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while fetching conversation with ID ${id}`,
    }
  }
}

// Create a new conversation
export async function createConversation(
  participants: string[],
  title?: string
): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify({ participants, title }),
      credentials: "include",
    })

    return await handleResponse<Conversation>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while creating conversation",
    }
  }
}

// Function to get user ID from various sources
function getUserId(): string | null {
  if (typeof window === "undefined") return null

  // Try multiple sources to get the user ID
  try {
    // First check the dedicated user ID storage
    const directUserId = localStorage.getItem("milestone-user-id")
    if (directUserId) return directUserId

    // Then try to get from user object in localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (user?.id) return user.id
    }

    // If not found, try to get from auth context global variable
         //@ts-ignore
    if (window.MILESTONE_USER_ID) {
      return window.MILESTONE_USER_ID ?? null
    }

    // Try to get from userRelationships
    const relationshipsStr = localStorage.getItem("userRelationships")
    if (relationshipsStr) {
      // The current user might be in one of these relationships
      const relationships = JSON.parse(relationshipsStr)
      // Look for an ID in any of the arrays
      for (const key in relationships) {
        if (
          Array.isArray(relationships[key]) &&
          relationships[key].length > 0
        ) {
          const firstItem = relationships[key][0]
          if (firstItem && firstItem.id) return firstItem.id
        }
      }
    }

    // Try to extract from the token as last resort
    const token = localStorage.getItem("milestone-token")
    if (token) {
      try {
        // Simple JWT parser that doesn't validate the token
        const parts = token.split(".")
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          if (payload.id) return payload.id
        }
      } catch (e) {
        console.error("Error parsing token:", e)
      }
    }
  } catch (e) {
    console.error("Error extracting user ID:", e)
  }

  return null
}

declare global {
  interface Window {
    MILESTONE_USER_ID?: string;
  }
}

export async function getTwilioToken(retryCount = 0) {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem("milestone-token")

    // Get user ID using our helper function
    const userId = getUserId()

    if (!userId) {
      console.error("No user ID available for Twilio token request")
      throw new Error("User authentication required to use chat features")
    }

    // Maximum retries to avoid infinite loop
    const MAX_RETRIES = 3
    if (retryCount > MAX_RETRIES) {
      console.error(
        `Max retry count (${MAX_RETRIES}) reached for Twilio token request`
      )
      throw new Error(
        "Failed to get a valid Twilio token after multiple attempts"
      )
    }

    // Clear any cached tokens to ensure we get a fresh one
    if (retryCount > 0) {
      console.log(
        `Retry attempt ${retryCount} for Twilio token, clearing any cached data`
      )
      // Add a timestamp to prevent browser caching
      localStorage.setItem("twilio-token-timestamp", Date.now().toString())

      // Add a small delay between retries with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, retryCount * 1000))
    }

    // Build the URL with fallback userId
    let url = "/api/twilio-token"
    if (userId) {
      url += `?userId=${userId}`
    }

    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    console.log("Requesting Twilio token with:", {
      hasToken: !!token,
      userId: userId, // Log the actual userId for debugging
      url,
      retryCount,
    })

    // Include cache control headers to prevent caching
    headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    headers["Pragma"] = "no-cache"

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store", // Ensures fresh request
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // If we got a 403 or 401, retry with a fresh request
      if (
        (response.status === 403 || response.status === 401) &&
        retryCount < MAX_RETRIES
      ) {
        console.log(
          `Got ${response.status} error, attempting retry #${retryCount + 1}`
        )
        return getTwilioToken(retryCount + 1)
      }

      throw new Error(
        `Failed to get Twilio token: ${response.statusText}. ${errorData.error || ""}`
      )
    }

    const data = await response.json()

    // Validate token
    if (!data.token) {
      // If no token returned, try again
      if (retryCount < MAX_RETRIES) {
        console.log("Empty token response, retrying...")
        return getTwilioToken(retryCount + 1)
      }
      throw new Error("Twilio token response is empty")
    }

    // Store identity from response if available
    if (data.identity) {
      localStorage.setItem("twilio-chat-identity", data.identity)
    }

    return data.token
  } catch (error) {
    console.error("Error getting Twilio token:", error)

    // If we encounter a specific error that might benefit from retry
    if (
      error instanceof Error &&
      (error.message.includes("403") ||
        error.message.includes("401") ||
        error.message.includes("SyncError")) &&
      retryCount < 3
    ) {
      console.log(
        `Error suggests auth issue, will retry. Error: ${error.message}`
      )
      return getTwilioToken(retryCount + 1)
    }

    throw error
  }
}
