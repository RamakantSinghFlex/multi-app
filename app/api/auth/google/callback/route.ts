/**
 * Google OAuth Callback Handler
 *
 * This route handles the callback from Google OAuth authentication.
 * It verifies the state token, exchanges the authorization code for tokens,
 * fetches user information, and either logs the user in or redirects to role selection.
 */

import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/monitoring"
import { API_URL, APP_URL } from "@/lib/config"

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

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(`${APP_URL}/login`) // fallback redirect, update later

  try {
    logger.info("Handling Google OAuth callback")

    // Get the authorization code and state from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const incomingState = searchParams.get("state")

    // Get the state from the cookie for verification
    const storedState = request.cookies.get("google_oauth_state")?.value

    // Clear the state cookie
    response.cookies.delete("google_oauth_state")

    // Verify the state to prevent CSRF attack
    if (!incomingState || !storedState || incomingState !== storedState) {
      logger.error("State mismatch in Google OAuth callback", {
        incomingState,
        storedState,
      })
      response.headers.set("Location", `${APP_URL}/login?error=invalid_state`)
      return response
    }

    if (!code) {
      logger.error("No authorization code in Google OAuth callback")
      response.headers.set("Location", `${APP_URL}/login?error=no_code`)
      return response
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || "",
        client_secret: GOOGLE_CLIENT_SECRET || "",
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      logger.error("Error exchanging code for tokens", { error: errorText })
      response.headers.set(
        "Location",
        `${APP_URL}/login?error=token_exchange_failed`
      )
      return response
    }

    const tokenData = await tokenResponse.json()

    // Get the user's profile information
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      logger.error("Error fetching user info from Google", { error: errorText })
      response.headers.set("Location", `${APP_URL}/login?error=userinfo_failed`)
      return response
    }

    const userInfo = await userInfoResponse.json()

    // Mock user handling in development
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.NEXT_PUBLIC_PAYLOAD_API_URL
    ) {
      response.cookies.set(
        "google_user_info",
        JSON.stringify({
          googleId: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name || "",
          lastName: userInfo.family_name || "",
          picture: userInfo.picture || "",
        }),
        COOKIE_OPTIONS
      )
      response.headers.set("Location", `${APP_URL}/auth/role-selection`)
      return response
    }

    const checkUserResponse = await fetch(
      `${API_URL}/users?where[email][equals]=${encodeURIComponent(userInfo.email)}`,
      { headers: { "Content-Type": "application/json" }, cache: "no-store" }
    )

    if (!checkUserResponse.ok) {
      const err = await checkUserResponse.text()
      logger.error("User lookup failed", { err })
      response.headers.set("Location", `${APP_URL}/login?error=auth_failed`)
      return response
    }

    const userCheck = await checkUserResponse.json()

    if (userCheck.docs && userCheck.docs.length > 0) {
      const loginResponse = await fetch(`${API_URL}/users/login-with-google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userInfo.email, googleId: userInfo.sub }),
        credentials: "include",
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        if (loginData.token) {
          response.cookies.set("milestone-token", loginData.token, {
            ...COOKIE_OPTIONS,
            maxAge: 60 * 60 * 24 * 7,
          })
        }

        const roles = loginData.user?.roles || []
        const role = roles[0] || "user"
        const roleRedirect =
          role === "admin"
            ? "/admin/dashboard"
            : role === "parent"
              ? "/parent/dashboard"
              : role === "tutor"
                ? "/tutor/dashboard"
                : role === "student"
                  ? "/student/dashboard"
                  : "/dashboard"

        response.headers.set(
          "Location",
          `${APP_URL}${roleRedirect}?welcome=returning`
        )
        return response
      } else {
        const err = await loginResponse.text()
        logger.error("Login failed", { err })
        response.headers.set("Location", `${APP_URL}/login?error=auth_failed`)
        return response
      }
    }

    // User doesn't exist, redirect to role-selection
    response.cookies.set(
      "google_user_info",
      JSON.stringify({
        googleId: userInfo.sub,
        email: userInfo.email,
        firstName: userInfo.given_name || "",
        lastName: userInfo.family_name || "",
        picture: userInfo.picture || "",
      }),
      { ...COOKIE_OPTIONS, maxAge: 600 }
    )

    response.headers.set("Location", `${APP_URL}/auth/role-selection`)
    return response
  } catch (error) {
    logger.error("OAuth callback unexpected error", { error })
    response.headers.set("Location", `${APP_URL}/login?error=unexpected`)
    return response
  }
}
