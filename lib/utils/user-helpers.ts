/**
 * Utility functions for working with users, students, tutors, and parents
 */

import type { BaseUser } from "@/lib/types"

/**
 * Format a user's full name
 */
export function formatUserName(user: BaseUser | string | null | undefined): string {
  if (!user) return "Unknown"
  if (typeof user === "string") return user

  const firstName = user.firstName || ""
  const lastName = user.lastName || ""
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || user.email || user.id || "Unknown"
}

/**
 * Get the primary role of a user
 */
export function getPrimaryRole(user: BaseUser | null | undefined): string {
  if (!user) return "unknown"

  // If there's a legacy role property, use it
  if (user.role) return user.role

  // Otherwise check the roles array
  if (user.roles && user.roles.length > 0) {
    return user.roles[0]
  }

  return "unknown"
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: BaseUser | null | undefined, role: string): boolean {
  if (!user) return false

  // Check legacy role property
  if (user.role === role) return true

  // Check roles array
  return user.roles?.includes(role) || false
}

/**
 * Convert a user ID or object to a consistent ID string
 */
export function getUserId(user: BaseUser | string | null | undefined): string | null {
  if (!user) return null
  if (typeof user === "string") return user
  return user.id
}

/**
 * Get a list of user IDs from an array of users or IDs
 */
export function getUserIds(users: Array<BaseUser | string> | null | undefined): string[] {
  if (!users) return []
  return users.map((user) => getUserId(user)).filter(Boolean) as string[]
}

/**
 * Find a user by ID in an array of users
 */
export function findUserById<T extends BaseUser>(
  users: T[] | null | undefined,
  id: string | null | undefined,
): T | undefined {
  if (!users || !id) return undefined
  return users.find((user) => user.id === id)
}

/**
 * Filter users by role
 */
export function filterUsersByRole<T extends BaseUser>(users: T[] | null | undefined, role: string): T[] {
  if (!users) return []
  return users.filter((user) => hasRole(user, role))
}
