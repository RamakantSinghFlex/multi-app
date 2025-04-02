import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse } from "../types"
import { API_URL } from "../config"

// Collection types
export interface Collection {
  id: string
  title: string
  slug: string
  description?: string
  thumbnail?: string
}

export interface Content {
  id: string
  title: string
  slug: string
  description?: string
  content?: any
  createdAt: string
  updatedAt: string
  thumbnail?: string
  collectionId?: string
}

// Get collections
export async function getCollections(): Promise<ApiResponse<Collection[]>> {
  try {
    const response = await fetch(`${API_URL}/collections`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Collection[]>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching collections",
    }
  }
}

// Get content by collection
export async function getContentByCollection(
  collectionSlug: string,
  page = 1,
  limit = 10,
): Promise<ApiResponse<PaginatedResponse<Content>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/${collectionSlug}?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Content>>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while fetching content for ${collectionSlug}`,
    }
  }
}

// Get content by ID
export async function getContentById(collectionSlug: string, id: string): Promise<ApiResponse<Content>> {
  try {
    const response = await fetch(`${API_URL}/${collectionSlug}/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Content>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching content with ID ${id}`,
    }
  }
}

