import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, Conversation, Message } from "../types"
import { API_URL } from "../config"

// Get conversations
export async function getConversations(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Conversation>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/conversations?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Conversation>>(response)
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

// Create conversation
export async function createConversation(data: {
  participants: string[]
  title?: string
}): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Conversation>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating conversation",
    }
  }
}

// Get messages for a conversation
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<ApiResponse<PaginatedResponse<Message>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Message>>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while fetching messages for conversation ${conversationId}`,
    }
  }
}

// Send message in a conversation
export async function sendMessage(
  conversationId: string,
  data: { content: string; attachments?: string[]; isSensitive?: boolean },
): Promise<ApiResponse<Message>> {
  try {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Message>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while sending message to conversation ${conversationId}`,
    }
  }
}

