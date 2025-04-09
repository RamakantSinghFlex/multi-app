// API URL
export const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || "http://localhost:3001/api"

// App URL
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

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
