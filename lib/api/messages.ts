import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, Message, Conversation } from "../types"
import { API_URL } from "../config"

// Get messages for a conversation
export async function getMessages(conversationId: string, page = 1, limit = 50): Promise<ApiResponse<Message[]>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Message[]>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching messages",
    }
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  content: string,
  isSensitive = false,
): Promise<ApiResponse<Message>> {
  try {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify({ content, isSensitive }),
      credentials: "include",
    })

    return await handleResponse<Message>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while sending message",
    }
  }
}

// Delete a message
export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
      headers: createAuthHeaders(false),
      credentials: "include",
    })

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
export async function getConversations(page = 1, limit = 10): Promise<ApiResponse<Conversation[]>> {
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
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching conversations",
    }
  }
}

// Get conversation by ID
export async function getConversation(id: string): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Conversation>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while fetching conversation with ID ${id}`,
    }
  }
}

// Create a new conversation
export async function createConversation(participants: string[], title?: string): Promise<ApiResponse<Conversation>> {
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
      error: error instanceof Error ? error.message : "An unknown error occurred while creating conversation",
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
    if (window.__MILESTONE_USER_ID) {
      return window.__MILESTONE_USER_ID
    }

    // Try to get from userRelationships
    const relationshipsStr = localStorage.getItem("userRelationships")
    if (relationshipsStr) {
      // The current user might be in one of these relationships
      const relationships = JSON.parse(relationshipsStr)
      // Look for an ID in any of the arrays
      for (const key in relationships) {
        if (Array.isArray(relationships[key]) && relationships[key].length > 0) {
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

export async function getTwilioToken() {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem("milestone-token")

    // Get user ID using our helper function
    const userId = getUserId()

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
      hasUserId: !!userId,
      url,
    })

    const response = await fetch(url, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to get Twilio token: ${response.statusText}. ${errorData.error || ""}`)
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error("Error getting Twilio token:", error)
    throw error
  }
}
