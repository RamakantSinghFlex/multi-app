import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, User } from "../types"
import { API_URL } from "../config"

// Create user
export async function createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(userData),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating user",
    }
  }
}

// Update user
export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating user with ID ${id}`,
    }
  }
}

// Delete user
export async function deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<{ success: boolean }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while deleting user with ID ${id}`,
    }
  }
}
