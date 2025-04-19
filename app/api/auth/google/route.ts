/**
 * Google OAuth Initialization
 *
 * This route initiates the Google OAuth flow by redirecting to Google's authorization endpoint.
 * It generates and stores a state token to prevent CSRF attacks.
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/monitoring"
import { APP_URL } from "@/lib/config"
import { createHash, randomBytes } from "crypto"

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`

// Scopes requested from Google
const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
].join(" ")

/**
 * Generate a CSRF token for OAuth state verification
 */
function generateStateToken(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex")
}

/**
 * Handle Google OAuth initialization
 */
export async function GET() {
  try {
    logger.info("Initiating Google OAuth flow")

    if (!GOOGLE_CLIENT_ID) {
      logger.error("Google OAuth client ID not configured")
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_init_failed`)
    }

    // Generate a state token to prevent CSRF attacks
    const state = generateStateToken()

    // Store the state token in a cookie
    cookies().set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    })

    // Build the authorization URL
    const authUrl = new URL(GOOGLE_AUTH_URL)
    authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID)
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("scope", SCOPES)
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("prompt", "select_account")
    authUrl.searchParams.append("access_type", "offline")

    logger.info("Redirecting to Google authorization endpoint")
    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    logger.error("Error initiating Google OAuth flow", { error })
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_init_failed`)
  }
}
