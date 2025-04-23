import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, Appointment } from "../types"
import { API_URL } from "../config"
import { getMe } from "@/lib/api"

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
export async function updateAppointment(data: any, authHeader: string): Promise<ApiResponse<any>> {
  try {
    const id = data.id
    if (!id) {
      return {
        error: "Appointment ID is required for updates",
      }
    }

    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while updating appointment",
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

// Update the getAppointments function to also refresh user data
export async function getAppointments(params: {
  student?: string
  tutor?: string
  parent?: string
}): Promise<ApiResponse<Appointment[]>> {
  try {
    const headers = createAuthHeaders()

    let queryString = ""
    if (params) {
      const whereClauses: string[] = []
      if (params.student) {
        whereClauses.push(`students.in:${params.student}`)
      }
      if (params.tutor) {
        whereClauses.push(`tutors.in:${params.tutor}`)
      }
      if (params.parent) {
        whereClauses.push(`parents.in:${params.parent}`)
      }

      if (whereClauses.length > 0) {
        queryString = `?where=${encodeURIComponent(whereClauses.join(" AND "))}`
      }
    }

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

      // Also refresh user data
      try {
        await getMe()
      } catch (refreshError) {
        console.warn("Failed to refresh user data:", refreshError)
        // Continue with appointments fetch even if user refresh fails
      }

      return {
        data: [
          {
            id: "1",
            title: "Math Tutoring",
            startTime: today.toISOString(),
            endTime: new Date(today.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
            status: "confirmed",
            students: [{ id: "s1", firstName: "John", lastName: "Doe" }],
            tutors: [{ id: "t1", firstName: "Jane", lastName: "Smith" }],
            parents: [{ id: "p1", firstName: "Robert", lastName: "Doe" }],
            payment: { id: "pay1", transactionId: "tx1", amount: 50, status: "completed" },
          },
          {
            id: "2",
            title: "Science Review",
            startTime: tomorrow.toISOString(),
            endTime: new Date(tomorrow.getTime() + 45 * 60 * 1000).toISOString(), // 45 minutes later
            status: "pending",
            students: [{ id: "s1", firstName: "John", lastName: "Doe" }],
            tutors: [{ id: "t2", firstName: "Robert", lastName: "Johnson" }],
            parents: [{ id: "p1", firstName: "Robert", lastName: "Doe" }],
            payment: { id: "pay2", transactionId: "tx2", amount: 40, status: "pending" },
          },
          {
            id: "3",
            title: "English Literature",
            startTime: nextWeek.toISOString(),
            endTime: new Date(nextWeek.getTime() + 90 * 60 * 1000).toISOString(), // 90 minutes later
            status: "confirmed",
            students: [{ id: "s2", firstName: "Sarah", lastName: "Williams" }],
            tutors: [{ id: "t1", firstName: "Jane", lastName: "Smith" }],
            parents: [{ id: "p2", firstName: "Michael", lastName: "Williams" }],
            payment: { id: "pay3", transactionId: "tx3", amount: 75, status: "completed" },
          },
        ],
      }
    }

    // First, fetch appointments
    const response = await fetch(`${API_URL}/appointments${queryString}`, {
      headers,
      credentials: "include",
    })

    const result = await handleResponse<PaginatedResponse<Appointment>>(response)

    // After fetching appointments, also refresh user data
    try {
      await getMe()
    } catch (refreshError) {
      console.warn("Failed to refresh user data:", refreshError)
      // Continue with appointments response even if user refresh fails
    }

    // Transform the paginated response to match our expected format
    if (result.data) {
      return {
        data: result.data.docs,
        pagination: {
          total: result.data.totalDocs,
          limit: result.data.limit,
          page: result.data.page,
          totalPages: result.data.totalPages,
          hasNextPage: result.data.hasNextPage,
          hasPrevPage: result.data.hasPrevPage,
        },
      }
    }

    return result as ApiResponse<Appointment[]>
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching appointments",
    }
  }
}
