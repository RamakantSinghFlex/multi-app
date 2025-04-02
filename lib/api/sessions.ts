import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, Session } from "../types"
import { API_URL } from "../config"

// Get sessions
export async function getSessions(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Session>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/sessions?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Session>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching sessions",
    }
  }
}

// Get session by ID
export async function getSession(id: string): Promise<ApiResponse<Session>> {
  try {
    const response = await fetch(`${API_URL}/sessions/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching session with ID ${id}`,
    }
  }
}

// Create session
export async function createSession(data: Partial<Session>): Promise<ApiResponse<Session>> {
  try {
    const response = await fetch(`${API_URL}/sessions`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating session",
    }
  }
}

// Update session
export async function updateSession(id: string, data: Partial<Session>): Promise<ApiResponse<Session>> {
  try {
    const response = await fetch(`${API_URL}/sessions/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating session with ID ${id}`,
    }
  }
}

// Cancel session
export async function cancelSession(id: string): Promise<ApiResponse<Session>> {
  try {
    const response = await fetch(`${API_URL}/sessions/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify({ status: "cancelled" }),
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while cancelling session with ID ${id}`,
    }
  }
}

