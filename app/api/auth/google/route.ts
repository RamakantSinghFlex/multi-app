import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/monitoring"

// Google OAuth configuration - using consistent environment variable names
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`

// Google OAuth endpoints
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

export async function GET(request: NextRequest) {
  try {
    logger.info("Starting Google OAuth flow")

    // Generate a random state value for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)
    const cookieAwaited = await cookies()
    // Store state in a cookie for verification later
    cookieAwaited.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    // Construct the authorization URL
    const authUrl = new URL(GOOGLE_AUTH_URL)
    authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID || "")
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("scope", "openid email profile")
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("prompt", "select_account")

    logger.info("Redirecting to Google authorization URL", { url: authUrl.toString() })

    // Redirect the user to Google's authorization page
    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    logger.error("Error initiating Google OAuth flow", { error })
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=oauth_init_failed`,
    )
  }
}
