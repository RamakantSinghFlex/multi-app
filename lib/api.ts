import type {
  ApiResponse,
  AuthResponse,
  Conversation,
  LoginCredentials,
  Message,
  PaginatedResponse,
  Parent,
  Session,
  SignupCredentials,
  Student,
  Subject,
  Tutor,
  User,
} from "./types"
import { ObjectId } from "bson"
import { logger } from "./monitoring"

// Update the API_URL to point to your actual API endpoint
const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || "https://ancient-yeti-453713-d0.uk.r.appspot.com/api"

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth data on 401 Unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("milestone-token")
      }
    }

    try {
      const errorData = await response.json()
      return {
        error: errorData.message || errorData.error || `Error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
      }
    } catch (e) {
      return {
        error: `Error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
      }
    }
  }

  try {
    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: "Failed to parse response" }
  }
}

// Get auth token from localStorage
function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("milestone-token")
  }
  return null
}

// Set auth token in localStorage
function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("milestone-token", token)
  }
}

// Clear auth token from localStorage
function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("milestone-token")
  }
}

// Authentication API calls
export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  try {
    console.log("API login called with:", credentials)

    // For development/testing, simulate a successful login with proper logging
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      console.log("DEV MODE: Simulating successful login")

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockResponse: AuthResponse = {
        user: {
          id: "123",
          email: credentials.email,
          firstName: "Test",
          lastName: "User",
          role: "parent",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: "mock-jwt-token",
        message: "Authentication Passed",
      }

      // Store the token
      setToken(mockResponse.token)

      console.log("DEV MODE: Returning mock response:", mockResponse)

      return {
        data: mockResponse,
      }
    }

    // Actual API call for production or when API URL is configured
    console.log("Making API request to:", `${API_URL}/users/login`)

    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    })

    console.log("API response status:", response.status)

    const result = await handleResponse<AuthResponse>(response)

    console.log("API response processed:", result)

    if (result.data?.token) {
      console.log("Setting token in localStorage")
      setToken(result.data.token)
    }

    return result
  } catch (error) {
    console.error("Login API error:", error)
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during login",
    }
  }
}

// Create user (signup)
export async function createUser(credentials: SignupCredentials): Promise<ApiResponse<User>> {
  try {
    // Add tenants if not already provided
    if (!credentials.tenants || credentials.tenants.length === 0) {
      credentials.tenants = [
        {
          id: new ObjectId(),
          tenant: "67e96de1c71e8d565d305a82",
        },
      ]
    }

    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating user",
    }
  }
}

// Update the signup function to properly handle the nested response structure
export async function signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
  try {
    // Add tenants if not already provided
    if (!credentials.tenants || credentials.tenants.length === 0) {
      credentials.tenants = [
        {
          id: new ObjectId(),
          tenant: "67e96de1c71e8d565d305a82",
        },
      ]
    }

    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    })

    const result = await handleResponse<{ doc: User; message: string }>(response)

    // If signup was successful, automatically log the user in
    if (result.data?.doc && !result.error) {
      const loginCredentials: LoginCredentials = {
        email: credentials.email,
        password: credentials.password,
      }

      // Call login API with the same credentials
      const loginResponse = await login(loginCredentials)

      if (loginResponse.data) {
        // Return the login response with the signup success message
        return {
          data: {
            ...loginResponse.data,
            message: result.data.message || "User successfully created and logged in.",
          },
        }
      }

      // If login fails, still return the signup success
      return {
        data: {
          user: result.data.doc,
          token: "",
          message: result.data.message || "User successfully created.",
        },
      }
    }

    // If there's no doc in the response but no error either, return an error
    if (!result.error) {
      return {
        error: "Invalid response format from server",
      }
    }

    return result
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during signup",
    }
  }
}

// Find the logout function and update it to match the curl request format
export async function logout(): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const token = getToken()
    if (!token) {
      clearToken()
      return { data: { success: true, message: "Logged out successfully." } }
    }

    console.log("Logging out with token:", token)

    const response = await fetch(`${API_URL}/users/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${token}`,
      },
      credentials: "include",
    })

    clearToken()
    const result = await handleResponse<{ message: string }>(response)

    return {
      data: {
        success: true,
        message: result.data?.message || "Logged out successfully.",
      },
    }
  } catch (error) {
    console.error("Logout error:", error)
    clearToken()
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during logout",
      data: { success: true, message: "Logged out successfully." }, // Consider logout successful even if API call fails
    }
  }
}

export async function getMe(): Promise<ApiResponse<User>> {
  const startTime = performance.now()
  try {
    const token = getToken()
    logger.info("getMe: Starting authentication check")

    if (!token) {
      logger.info("getMe: No token found, user is not authenticated")
      return { error: "Not authenticated" }
    }

    logger.info("getMe: Token found, validating session")

    // For development/testing without an API
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      logger.info("getMe: DEV MODE - Simulating successful session validation")

      // Add a small delay to simulate network request
      await new Promise((resolve) => setTimeout(resolve, 300))

      const mockUser: User = {
        id: "123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "parent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      logger.info("getMe: DEV MODE - Returning mock user", { email: mockUser.email })
      return { data: mockUser }
    }

    logger.info("getMe: Making API request to validate session", { url: `${API_URL}/users/me` })

    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
      credentials: "include",
    })

    logger.info("getMe: Session validation response received", { status: response.status })

    const result = await handleResponse<User>(response)

    if (result.error) {
      logger.warn("getMe: Session validation failed", { error: result.error })
    } else {
      logger.info("getMe: Session validation successful", {
        email: result.data?.email,
        role: result.data?.role,
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logger.error("getMe: Session validation error", { error: errorMessage })
    return {
      error: errorMessage,
    }
  } finally {
    const duration = performance.now() - startTime
    logger.info(`getMe: Completed in ${duration.toFixed(2)}ms`)
  }
}

// Get users
export async function getUsers(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
  try {
    const token = getToken()
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/users?${queryString}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<User>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching users",
    }
  }
}

// User API calls
export async function getUser(id: string): Promise<ApiResponse<User>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching user with ID ${id}`,
    }
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<User>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating user with ID ${id}`,
    }
  }
}

// Delete user
export async function deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<{ success: boolean }>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while deleting user with ID ${id}`,
    }
  }
}

// Parent API calls
export async function getParents(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Parent>>> {
  try {
    const token = getToken()
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/parents?${queryString}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Parent>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching parents",
    }
  }
}

export async function getParent(id: string): Promise<ApiResponse<Parent>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/parents/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<Parent>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching parent with ID ${id}`,
    }
  }
}

export async function createParent(data: Partial<Parent>): Promise<ApiResponse<Parent>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/parents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Parent>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating parent",
    }
  }
}

export async function updateParent(id: string, data: Partial<Parent>): Promise<ApiResponse<Parent>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/parents/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Parent>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating parent with ID ${id}`,
    }
  }
}

// Student API calls
export async function getStudents(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Student>>> {
  try {
    const token = getToken()
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/students?${queryString}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Student>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching students",
    }
  }
}

export async function getStudent(id: string): Promise<ApiResponse<Student>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/students/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<Student>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching student with ID ${id}`,
    }
  }
}

export async function createStudent(data: Partial<Student>): Promise<ApiResponse<Student>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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

export async function updateStudent(id: string, data: Partial<Student>): Promise<ApiResponse<Student>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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

// Tutor API calls
export async function getTutors(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Tutor>>> {
  try {
    const token = getToken()
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/tutors?${queryString}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Tutor>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching tutors",
    }
  }
}

export async function getTutor(id: string): Promise<ApiResponse<Tutor>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/tutors/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<Tutor>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching tutor with ID ${id}`,
    }
  }
}

export async function createTutor(data: Partial<Tutor>): Promise<ApiResponse<Tutor>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/tutors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Tutor>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating tutor",
    }
  }
}

export async function updateTutor(id: string, data: Partial<Tutor>): Promise<ApiResponse<Tutor>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/tutors/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Tutor>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating tutor with ID ${id}`,
    }
  }
}

// Subject API calls
export async function getSubjects(): Promise<ApiResponse<Subject[]>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/subjects`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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
    const token = getToken()
    const response = await fetch(`${API_URL}/subjects/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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
    const token = getToken()
    const response = await fetch(`${API_URL}/subjects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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
    const token = getToken()
    const response = await fetch(`${API_URL}/subjects/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Subject>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while updating subject with ID ${id}",
    }
  }
}

// Session API calls
export async function getSessions(page = 1, limit = 10, query = {}): Promise<ApiResponse<PaginatedResponse<Session>>> {
  try {
    const token = getToken()
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...query,
    }).toString()

    const response = await fetch(`${API_URL}/sessions?${queryString}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Session>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching sessions",
    }
  }
}

export async function getSession(id: string): Promise<ApiResponse<Session>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/sessions/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching session with ID ${id}`,
    }
  }
}

export async function createSession(data: Partial<Session>): Promise<ApiResponse<Session>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating session",
    }
  }
}

export async function updateSession(id: string, data: Partial<Session>): Promise<ApiResponse<Session>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/sessions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while updating session with ID ${id}`,
    }
  }
}

// Cancel session
export async function cancelSession(id: string): Promise<ApiResponse<Session>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/sessions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify({ status: "cancelled" }),
      credentials: "include",
    })

    return await handleResponse<Session>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while cancelling session with ID ${id}`,
    }
  }
}

// Messaging API calls
export async function getConversations(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Conversation>>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/conversations?page=${page}&limit=${limit}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Conversation>>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching conversations",
    }
  }
}

export async function getConversation(id: string): Promise<ApiResponse<Conversation>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<Conversation>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : `An unknown error occurred while fetching conversation with ID ${id}`,
    }
  }
}

export async function createConversation(data: {
  participants: string[]
  title?: string
}): Promise<ApiResponse<Conversation>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Conversation>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred while creating conversation",
    }
  }
}

export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<ApiResponse<PaginatedResponse<Message>>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<PaginatedResponse<Message>>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while fetching messages for conversation ${conversationId}`,
    }
  }
}

export async function sendMessage(
  conversationId: string,
  data: { content: string; attachments?: string[]; isSensitive?: boolean },
): Promise<ApiResponse<Message>> {
  try {
    const token = getToken()
    const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(data),
      credentials: "include",
    })

    return await handleResponse<Message>(response)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : `An unknown error occurred while sending message to conversation ${conversationId}`,
    }
  }
}

// File upload
export async function uploadFile(file: File): Promise<ApiResponse<{ url: string; id: string }>> {
  try {
    const token = getToken()
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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
    const token = getToken()
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/documents?${queryString}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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
    const token = getToken()
    const response = await fetch(`${API_URL}/documents/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<Document>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching document with ID ${id}`,
    }
  }
}

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
    const token = getToken()
    const response = await fetch(`${API_URL}/collections`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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
    const token = getToken()
    const queryString = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString()

    const response = await fetch(`${API_URL}/${collectionSlug}?${queryString}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
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
    const token = getToken()
    const response = await fetch(`${API_URL}/${collectionSlug}/${id}`, {
      headers: {
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      credentials: "include",
    })

    return await handleResponse<Content>(response)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : `An unknown error occurred while fetching content with ID ${id}`,
    }
  }
}

export type { User }

