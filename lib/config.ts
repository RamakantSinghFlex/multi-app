// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || "/api"

// App URL
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Authentication Configuration
export const AUTH_TOKEN_KEY = "auth_token"
export const AUTH_COOKIE_NAME = "payload-token"

// Enable logging
export const ENABLE_LOGGING = process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true"

// Google OAuth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
export const GOOGLE_CALLBACK_URL = `${APP_URL}/api/auth/google/callback`

// JWT Secret
export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// JWT Expiration
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "7d"

// Cookie options
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// Feature Flags
export const FEATURES = {
  GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true",
  MOCK_API: process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL,
}

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
}
