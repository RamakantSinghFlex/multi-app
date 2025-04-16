"use client"

import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, Student, User } from "../types"
import { API_URL } from "../config"

// Get students

// Get student by ID

// Create student
export async function createStudent(data: Partial<Student>): Promise<ApiResponse<Student>> {
  try {
    const headers = createAuthHeaders()
    headers["Content-Type"] = "application/json"

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

// Upsert student with optional parent and tutor creation
export async function upsertStudent(data: {
  student: Partial<User>
  parent?: Partial<User>
  tutor?: Partial<User>
}): Promise<
  ApiResponse<{
    student: User
    parent?: User
    tutor?: User
  }>
> {
  try {
    const response = await fetch(`${API_URL}/users/upsert`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<{
      student: User
      parent?: User
      tutor?: User
    }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while upserting student",
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
