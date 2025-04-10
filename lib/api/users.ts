import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, SignupCredentials, User } from "../types"
import { API_URL } from "../config"
import { ObjectId } from "bson"

// Create user (signup)
export async function createUser(credentials: SignupCredentials): Promise<ApiResponse<User>> {
    try {
        credentials.tenantName = "Tenant 1"
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
            credentials: "include",
        })

        return await handleResponse<User>(response)
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "An unknown error occurred while creating user",
        }
    }
}

// Get users
export async function getUsers(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
        const queryString = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...query,
        }).toString()

        const response = await fetch(`${API_URL}/users?${queryString}`, {
            headers: createAuthHeaders(false),
            credentials: "include",
        })

        return await handleResponse<PaginatedResponse<User>>(response)
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "An unknown error occurred while fetching users",
        }
    }
}

// Get user by ID
export async function getUser(id: string): Promise<ApiResponse<User>> {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: createAuthHeaders(false),
            credentials: "include",
        })

        return await handleResponse<User>(response)
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : `An unknown error occurred while fetching user with ID ${id}`,
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
export async function deleteUser(id: string): Promise<ApiResponse<{success: boolean}>> {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: "DELETE",
            headers: createAuthHeaders(false),
            credentials: "include",
        })

        return await handleResponse<{success: boolean}>(response)
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : `An unknown error occurred while deleting user with ID ${id}`,
        }
    }
}
