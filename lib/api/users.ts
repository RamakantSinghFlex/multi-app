import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, User } from "../types"
import { API_URL } from "../config"

// Upsert user - new function for upserting users
export async function createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users/upsert`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(userData),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while upserting user",
    }
  }
}

// Update user
export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users/upsert`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify({ ...data, id }), // Include the ID in the payload
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating user with ID ${id}`,
    }
  }
}

// Update user with PATCH method
export async function patchUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
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
      error: error instanceof Error ? error.message : `An unknown error occurred while patching user with ID ${id}`,
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

// Get user by ID
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "GET",
      headers: createAuthHeaders(),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching user with ID ${id}`,
    }
  }
}
