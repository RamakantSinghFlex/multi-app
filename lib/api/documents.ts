import { handleResponse, createAuthHeaders } from "../api-utils"
import type { ApiResponse, PaginatedResponse, Document } from "../types"
import { API_URL } from "../config"

// Upload file
export async function uploadFile(file: File): Promise<ApiResponse<{ url: string; id: string }>> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    // Create headers without Content-Type as it will be set automatically for FormData
    const headers = createAuthHeaders(false)

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    })

    return await handleResponse<{ url: string; id: string }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while uploading file",
    }
  }
}

// Get documents
export async function getDocuments(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Document>>> {
  try {
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/documents?${queryString}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Document>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching documents",
    }
  }
}

// Get document by ID
export async function getDocument(id: string): Promise<ApiResponse<Document>> {
  try {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<Document>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching document with ID ${id}`,
    }
  }
}

// Upload document
export async function uploadDocument(file: File, metadata: any): Promise<ApiResponse<Document>> {
  try {
    // First upload the file
    const uploadResult = await uploadFile(file)

    if (uploadResult.error) {
      return { error: uploadResult.error }
    }

    // Then create the document with the file URL
    const documentData = {
      ...metadata,
      fileUrl: uploadResult.data?.url,
      fileId: uploadResult.data?.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    }

    const response = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(documentData),
      credentials: "include",
    })

    return await handleResponse<Document>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while uploading document",
    }
  }
}

// Delete document
export async function deleteDocument(id: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(false),
      credentials: "include",
    })

    return await handleResponse<{ success: boolean }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while deleting document with ID ${id}`,
    }
  }
}
