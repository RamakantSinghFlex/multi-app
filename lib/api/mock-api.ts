/**
 * Mock API Responses
 *
 * This module provides mock responses for development and testing.
 * It should only be used in development mode.
 */

import type { User, AuthResponse } from "../types"
import { logger } from "../monitoring"

// Mock user data
const mockUsers: Record<string, User> = {
  "123": {
    id: "123",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    roles: ["admin"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "124": {
    id: "124",
    email: "parent@example.com",
    firstName: "Parent",
    lastName: "User",
    roles: ["parent"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "125": {
    id: "125",
    email: "tutor@example.com",
    firstName: "Tutor",
    lastName: "User",
    roles: ["tutor"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "126": {
    id: "126",
    email: "student@example.com",
    firstName: "Student",
    lastName: "User",
    roles: ["student"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

// Mock response generators
const mockResponses: Record<string, (data?: any) => any> = {
  // Authentication responses
  login: (data?: { email: string }): AuthResponse => {
    const email = data?.email || "test@example.com"

    // Check if we have a mock user with this email
    const existingUser = Object.values(mockUsers).find((user) => user.email === email)

    if (existingUser) {
      return {
        user: existingUser,
        token: `mock-jwt-token-${existingUser.id}`,
      }
    }

    // Default mock user
    return {
      user: {
        id: "123",
        email,
        firstName: "Test",
        lastName: "User",
        roles: ["parent"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "mock-jwt-token",
    }
  },

  signup: (data?: any): AuthResponse => {
    const newId = String(Date.now())
    const newUser: User = {
      id: newId,
      email: data?.email || "new@example.com",
      firstName: data?.firstName || "New",
      lastName: data?.lastName || "User",
      roles: data?.roles || ["user"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to mock users
    mockUsers[newId] = newUser

    return {
      user: newUser,
      token: `mock-jwt-token-${newId}`,
      message: "Account created successfully!",
    }
  },

  currentUser: (): User => {
    // Return the first mock user
    return mockUsers["123"]
  },

  // User management responses
  createUser: (data?: Partial<User>): User => {
    const newId = String(Date.now())
    const newUser: User = {
      id: newId,
      email: data?.email || `user-${newId}@example.com`,
      firstName: data?.firstName || "New",
      lastName: data?.lastName || "User",
      roles: data?.roles || ["user"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to mock users
    mockUsers[newId] = newUser

    return newUser
  },

  updateUser: (data?: Partial<User>): User => {
    const id = data?.id || "123"
    const existingUser = mockUsers[id]

    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`)
    }

    const updatedUser = {
      ...existingUser,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    // Update mock users
    mockUsers[id] = updatedUser

    return updatedUser
  },
}

/**
 * Get a mock response for the specified endpoint
 * @param endpoint API endpoint
 * @param data Optional data to customize the response
 * @returns Mock response data
 */
export function getMockResponse<T>(endpoint: string, data?: any): T {
  logger.debug(`Getting mock response for ${endpoint}`, data)

  const mockResponseFn = mockResponses[endpoint]

  if (!mockResponseFn) {
    logger.warn(`No mock response defined for ${endpoint}`)
    return {} as T
  }

  try {
    return mockResponseFn(data) as T
  } catch (error) {
    logger.error(`Error generating mock response for ${endpoint}:`, error)
    return {} as T
  }
}
