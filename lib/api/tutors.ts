import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, Tutor } from "../types"
import { API_URL } from "../config"

// Get tutors
export async function getTutors(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Tutor>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/tutors?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Tutor>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching tutors",
    }
  }
}

// Get tutor by ID
export async function getTutor(id: string): Promise<ApiResponse<Tutor>> {
  try {
    const response = await fetch(`${API_URL}/tutors/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Tutor>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching tutor with ID ${id}`,
    }
  }
}

// Create tutor
export async function createTutor(data: Partial<Tutor>): Promise<ApiResponse<Tutor>> {
  try {
    const response = await fetch(`${API_URL}/tutors`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Tutor>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating tutor",
    }
  }
}

// Update tutor
export async function updateTutor(id: string, data: Partial<Tutor>): Promise<ApiResponse<Tutor>> {
  try {
    const response = await fetch(`${API_URL}/tutors/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Tutor>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating tutor with ID ${id}`,
    }
  }
}
