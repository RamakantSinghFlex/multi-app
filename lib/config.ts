/**
 * Application Configuration
 *
 * This module centralizes configuration settings for the application.
 * Environment variables are accessed here to provide a single source of truth.
 */

// Enable or disable logging
export const ENABLE_LOGGING = false

// Other configuration values
export const APP_NAME = "Milestone Learning"
export const APP_DESCRIPTION = "Personalized tutoring services for high-achieving students"

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || "/api"

// App URL with fallback for development
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Tenant configuration
export const TENANT_NAME = process.env.TENANT_NAME || "Tenant 1"

// Authentication Configuration
export const AUTH_TOKEN_KEY = "milestone-token"
export const AUTH_COOKIE_NAME = "payload-token"

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-CHANGE-IN-PRODUCTION"
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d"

// Cookie options with secure defaults
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// Feature Flags
export const FEATURES = {
  MOCK_API: process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL,
  ENABLE_GOOGLE_AUTH: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
}

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
}

// API Timeouts
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  LONG: 60000, // 60 seconds
  SHORT: 10000, // 10 seconds
}

// Development helpers - only used in development mode
export const DEV_CONFIG = {
  SIMULATE_SLOW_API: process.env.NEXT_PUBLIC_SIMULATE_SLOW_API === "true",
  SLOW_API_DELAY: Number.parseInt(process.env.NEXT_PUBLIC_SLOW_API_DELAY || "1000", 10),
}
