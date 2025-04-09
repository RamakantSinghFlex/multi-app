import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, Student } from "../types"
import { API_URL } from "../config"

// Get students
export async function getStudents(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Student>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/students?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Student>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching students",
    }
  }
}

// Get student by ID
export async function getStudent(id: string): Promise<ApiResponse<Student>> {
  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Student>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching student with ID ${id}`,
    }
  }
}

// Create student
export async function createStudent(data: Partial<Student>): Promise<ApiResponse<Student>> {
  try {
    const response = await fetch(`${API_URL}/students`, {
      method: "POST",
      headers: createAuthHeaders(),
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
