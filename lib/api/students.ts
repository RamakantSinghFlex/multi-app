"use client"

import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, Student } from "../types"
import { API_URL } from "../config"

// Get students

// Get student by ID

// Create student
export async function createStudent(data: Partial<Student>): Promise<ApiResponse<Student>> {
  try {
    // Remove the direct hook call
    // const { user } = useAuth() <- This was causing the error
    const headers = {}
    headers["Content-Type"] = "application/json"

    // Use the data as provided by the component
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Student>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating student",
    }
  }
}

// Update student
export async function updateStudent(id: string, data: Partial<Student>): Promise<ApiResponse<Student>> {
  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Student>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating student with ID ${id}`,
    }
  }
}

// Delete student
export async function deleteStudent(id: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<{ success: boolean }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while deleting student with ID ${id}`,
    }
  }
}
