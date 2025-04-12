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
