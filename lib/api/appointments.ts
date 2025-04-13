import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse } from "../types"
import { API_URL } from "../config"

// Create appointment
export async function createAppointment(data: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating appointment",
    }
  }
}

// Update appointment
export async function updateAppointment(id: string, data: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while updating appointment with ID ${id}`,
    }
  }
}

// Cancel appointment
export async function cancelAppointment(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: createAuthHeaders(),
      body: JSON.stringify({ status: "cancelled" }),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while cancelling appointment with ID ${id}`,
    }
  }
}

// Get appointments
export async function getAppointments(params?: Record<string, string>): Promise<ApiResponse<any[]>> {
  try {
    const headers = createAuthHeaders()

    // Build query string from params
    const queryString = params ? "?" + new URLSearchParams(params).toString() : ""

    // For development/testing without an API
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log(`DEV MODE: Simulating appointments fetch with params: ${queryString}`)

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 300))

      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      return {
        data: [
          {
            id: "1",
            title: "Math Tutoring",
            startDate: today.toISOString(),
            endDate: new Date(today.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
            status: "confirmed",
            student: { id: "s1", firstName: "John", lastName: "Doe" },
            tutor: { id: "t1", firstName: "Jane", lastName: "Smith" },
          },
          {
            id: "2",
            title: "Science Review",
            startDate: tomorrow.toISOString(),
            endDate: new Date(tomorrow.getTime() + 45 * 60 * 1000).toISOString(), // 45 minutes later
            status: "pending",
            student: { id: "s1", firstName: "John", lastName: "Doe" },
            tutor: { id: "t2", firstName: "Robert", lastName: "Johnson" },
          },
          {
            id: "3",
            title: "English Literature",
            startDate: nextWeek.toISOString(),
            endDate: new Date(nextWeek.getTime() + 90 * 60 * 1000).toISOString(), // 90 minutes later
            status: "confirmed",
            student: { id: "s2", firstName: "Sarah", lastName: "Williams" },
            tutor: { id: "t1", firstName: "Jane", lastName: "Smith" },
          },
        ],
      }
    }

    const response = await fetch(`${API_URL}/appointments${queryString}`, {
      headers,
      credentials: "include",
    })

    return await handleResponse<any[]>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching appointments",
    }
  }
}
