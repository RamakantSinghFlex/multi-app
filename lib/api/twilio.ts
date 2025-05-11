import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse } from "../types"
import { API_URL } from "../config"

// Get a Twilio token for the current user
export async function getTwilioToken(): Promise<ApiResponse<{ token: string }>> {
  try {
    const response = await fetch(`${API_URL}/twilio/token`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<{ token: string }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching Twilio token",
    }
  }
}

// Create a new conversation
export async function createTwilioConversation(
  participants: string[],
  friendlyName?: string,
): Promise<ApiResponse<{ conversationSid: string }>> {
  try {
    const response = await fetch(`${API_URL}/twilio/conversations`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify({ participants, friendlyName }),
      credentials: "include",
    })

    return await handleResponse<{ conversationSid: string }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating conversation",
    }
  }
}

// Get all conversations for the current user
export async function getTwilioConversations(): Promise<
  ApiResponse<{ conversations: Array<{ sid: string; friendlyName: string; lastMessage?: string }> }>
> {
  try {
    const response = await fetch(`${API_URL}/twilio/conversations`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<{
      conversations: Array<{ sid: string; friendlyName: string; lastMessage?: string }>
    }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching conversations",
    }
  }
}

// Upload a file attachment to a conversation
export async function uploadAttachment(
  conversationSid: string,
  file: File,
): Promise<ApiResponse<{ mediaUrl: string; mediaSid: string }>> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/twilio/conversations/${conversationSid}/attachments`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })

    return await handleResponse<{ mediaUrl: string; mediaSid: string }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while uploading attachment",
    }
  }
}
