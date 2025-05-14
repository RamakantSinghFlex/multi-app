import { createAuthHeaders, handleResponse } from "@/lib/api-utils"
import { API_URL } from "@/lib/config"

export async function getPagesData(limit = 10, page = 1) {
  try {
    const response = await fetch(
      `${API_URL}/pages?limit=${limit}&page=${page}`,
      {
        method: "GET",
        headers: createAuthHeaders(),
        credentials: "include",
      }
    )

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching page data",
    }
  }
}

export async function getPageData(slug: string) {
  try {
    const response = await fetch(
      `${API_URL}/pages?where[slug][equals]=${slug}`,
      {
        method: "GET",
        headers: createAuthHeaders(),
        credentials: "include",
      }
    )

    return await handleResponse<any>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching page data",
    }
  }
}
