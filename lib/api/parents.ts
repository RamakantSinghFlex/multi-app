import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, Parent } from "../types"
import { API_URL } from "../config"

// Get parents
export async function getParents(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Parent>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/parents?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Parent>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching parents",
    }
  }
}

// Get parent by ID
export async function getParent(id: string): Promise<ApiResponse<Parent>> {
  try {
    const response = await fetch(`${API_URL}/parents/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Parent>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching parent with ID ${id}`,
    }
  }
}

// Create parent
export async function createParent(data: Partial<Parent>): Promise<ApiResponse<Parent>> {
  try {
    const response = await fetch(`${API_URL}/parents`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Parent>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating parent",
    }
  }
}

// Update parent
export async function updateParent(id: string, data: Partial<Parent>): Promise<ApiResponse<Parent>> {
  try {
    const response = await fetch(`${API_URL}/parents/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Parent>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating parent with ID ${id}`,
    }
  }
}

