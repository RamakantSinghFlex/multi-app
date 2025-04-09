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
