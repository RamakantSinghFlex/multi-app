import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, Subject } from "../types"
import { API_URL } from "../config"

// Get subjects
export async function getSubjects(): Promise<ApiResponse<Subject[]>> {
  try {
    const response = await fetch(`${API_URL}/subjects`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Subject[]>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching subjects",
    }
  }
}

// Get subject by ID
export async function getSubject(id: string): Promise<ApiResponse<Subject>> {
  try {
    const response = await fetch(`${API_URL}/subjects/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Subject>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching subject with ID ${id}`,
    }
  }
}

// Create subject
export async function createSubject(data: Partial<Subject>): Promise<ApiResponse<Subject>> {
  try {
    const response = await fetch(`${API_URL}/subjects`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Subject>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating subject",
    }
  }
}

// Update subject
export async function updateSubject(id: string, data: Partial<Subject>): Promise<ApiResponse<Subject>> {
  try {
    const response = await fetch(`${API_URL}/subjects/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Subject>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating subject with ID ${id}`,
    }
  }
}

