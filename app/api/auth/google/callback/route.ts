/**
 * Google OAuth Callback Handler
 *
 * This route handles the callback from Google OAuth authentication.
 * It verifies the state token, exchanges the authorization code for tokens,
 * fetches user information, and either logs the user in or redirects to role selection.
 */

import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/monitoring"
import { API_URL, APP_URL } from "@/lib/config"
import { createHash, randomBytes } from "crypto"

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`

// Google OAuth endpoints
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 10, // 10 minutes
}

/**
 * Generate a CSRF token for OAuth state verification
 */
function generateStateToken(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex")
}

/**
 * Handle Google OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    logger.info("Handling Google OAuth callback")

    // Get the authorization code and state from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const incomingState = searchParams.get("state")
    const cookieStore = cookies()

    // Get the state from the cookie for verification
    const storedState = cookieStore.get("google_oauth_state")?.value

    // Clear the state cookie
    cookieStore.delete("google_oauth_state")

    // Verify the state to prevent CSRF attacks
    if (!incomingState || !storedState || incomingState !== storedState) {
      logger.error("State mismatch in Google OAuth callback", { incomingState, storedState })
      return NextResponse.redirect(`${APP_URL}/login?error=invalid_state`)
    }

    if (!code) {
      logger.error("No authorization code in Google OAuth callback")
      return NextResponse.redirect(`${APP_URL}/login?error=no_code`)
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || "",
        client_secret: GOOGLE_CLIENT_SECRET || "",
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      logger.error("Error exchanging code for tokens", { error: tokenError, status: tokenResponse.status })
      return NextResponse.redirect(`${APP_URL}/login?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()

    // Get the user's profile information
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      const userInfoError = await userInfoResponse.text()
      logger.error("Error fetching user info from Google", { error: userInfoError, status: userInfoResponse.status })
      return NextResponse.redirect(`${APP_URL}/login?error=userinfo_failed`)
    }

    const userInfo = await userInfoResponse.json()
    logger.info("Successfully retrieved Google user info", { email: userInfo.email })

    // Use mock implementation for development
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      // For development, we'll simulate the user not existing and redirect to role selection
      logger.info("DEV MODE: Redirecting to role selection page")

      // Store Google user info in a temporary cookie for the role selection page
      cookieStore.set(
        "google_user_info",
        JSON.stringify({
          googleId: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name || "",
          lastName: userInfo.family_name || "",
          picture: userInfo.picture || "",
        }),
        COOKIE_OPTIONS,
      )

      return NextResponse.redirect(`${APP_URL}/auth/role-selection`)
    }

    // Check if user exists by email
    try {
      // First, try to check if the user exists by email
      const checkUserResponse = await fetch(
        `${API_URL}/users?where[email][equals]=${encodeURIComponent(userInfo.email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      )

      if (!checkUserResponse.ok) {
        const checkUserError = await checkUserResponse.text()
        logger.error("Error checking if user exists", { error: checkUserError, status: checkUserResponse.status })
        return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`)
      }

      const checkUserData = await checkUserResponse.json()

      // If user exists, log them in
      if (checkUserData.docs && checkUserData.docs.length > 0) {
        logger.info("User found, attempting to log in", { email: userInfo.email })

        // Try to login with the email
        const loginResponse = await fetch(`${API_URL}/users/login-with-google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userInfo.email,
            googleId: userInfo.sub,
          }),
          credentials: "include",
        })

        // If login successful, redirect to dashboard
        if (loginResponse.ok) {
          const loginData = await loginResponse.json()

          // Set the JWT token in a cookie
          if (loginData.token) {
            cookieStore.set("milestone-token", loginData.token, {
              ...COOKIE_OPTIONS,
              maxAge: 60 * 60 * 24 * 7, // 1 week
            })
          }

          // Redirect to the appropriate dashboard based on user role
          const roles = loginData.user?.roles || []
          const role = roles.length > 0 ? roles[0] : "user"
          let redirectUrl = "/dashboard"

          if (role === "admin") {
            redirectUrl = "/admin/dashboard"
          } else if (role === "parent") {
            redirectUrl = "/parent/dashboard"
          } else if (role === "tutor") {
            redirectUrl = "/tutor/dashboard"
          } else if (role === "student") {
            redirectUrl = "/student/dashboard"
          }

          logger.info("Google authentication successful, redirecting to dashboard", { role, redirectUrl })
          return NextResponse.redirect(`${APP_URL}${redirectUrl}?welcome=returning`)
        } else {
          const loginError = await loginResponse.text()
          logger.error("Error logging in with Google", { error: loginError, status: loginResponse.status })
          return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`)
        }
      }

      // User doesn't exist or login failed, redirect to role selection
      logger.info("User not found, redirecting to role selection", { email: userInfo.email })

      // Store Google user info in a temporary cookie for the role selection page
      cookieStore.set(
        "google_user_info",
        JSON.stringify({
          googleId: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name || "",
          lastName: userInfo.family_name || "",
          picture: userInfo.picture || "",
        }),
        COOKIE_OPTIONS,
      )

      return NextResponse.redirect(`${APP_URL}/auth/role-selection`)
    } catch (error) {
      logger.error("Error checking if user exists", { error })
      return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`)
    }
  } catch (error) {
    logger.error("Unexpected error in Google OAuth callback", { error })
    return NextResponse.redirect(`${APP_URL}/login?error=unexpected`)
  }
}
