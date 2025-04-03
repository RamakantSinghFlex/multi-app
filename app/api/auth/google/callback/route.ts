import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/monitoring"
import { API_URL } from "@/lib/config"
import { mockGoogleAuth } from "@/lib/api-utils"

// Google OAuth configuration - using consistent environment variable names
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`

// Google OAuth endpoints
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

export async function GET(request: NextRequest) {
  try {
    logger.info("Handling Google OAuth callback")

    // Get the authorization code and state from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const incomingState = searchParams.get("state")
    const cookieAwaited = await cookies();

    // Get the state from the cookie for verification
    const storedState = cookieAwaited.get("google_oauth_state")?.value

    // Clear the state cookie
    cookieAwaited.delete("google_oauth_state")

    // Verify the state to prevent CSRF attacks
    if (!incomingState || !storedState || incomingState !== storedState) {
      logger.error("State mismatch in Google OAuth callback", { incomingState, storedState })
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=invalid_state`,
      )
    }

    if (!code) {
      logger.error("No authorization code in Google OAuth callback")
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=no_code`)
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

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      logger.error("Error exchanging code for tokens", { error: tokenData })
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=token_exchange_failed`,
      )
    }

    // Get the user's profile information
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    if (!userInfoResponse.ok) {
      logger.error("Error fetching user info from Google", { error: userInfo })
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=userinfo_failed`,
      )
    }

    logger.info("Successfully retrieved Google user info", { email: userInfo.email })

    // Now authenticate with PayloadCMS using the Google profile
    let payloadData

    // Use mock implementation for development
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      payloadData = await mockGoogleAuth({
        googleId: userInfo.sub,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        profileImage: userInfo.picture,
      })

      logger.info("Using mock Google authentication in development mode")
    } else {
      // Real implementation for production
      const payloadResponse = await fetch(`${API_URL}/users/google-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleId: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          profileImage: userInfo.picture,
        }),
        credentials: "include",
      })

      payloadData = await payloadResponse.json()

      if (!payloadResponse.ok) {
        logger.error("Error authenticating with PayloadCMS", { error: payloadData })
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=auth_failed`,
        )
      }
    }

    // Set the JWT token in a cookie
    if (payloadData?.token) {
      const cookieAwaited = await cookies();

      cookieAwaited.set("milestone-token", payloadData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })
    }

    // Redirect to the appropriate dashboard based on user role
    const role = payloadData?.user?.role || "user"
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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${redirectUrl}`)
  } catch (error) {
    logger.error("Unexpected error in Google OAuth callback", { error })
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?error=unexpected`)
  }
}

