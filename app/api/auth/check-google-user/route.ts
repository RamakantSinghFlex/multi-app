import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/monitoring"

export async function GET(request: NextRequest) {
  try {
    logger.info("Checking for Google user info cookie")

    // Get the Google user info from the cookie
    const cookieStore = await cookies()
    const googleUserInfoCookie = cookieStore.get("google_user_info")

    if (!googleUserInfoCookie) {
      logger.info("No Google user info cookie found")
      return NextResponse.json({ googleUser: null })
    }

    // Parse the Google user info
    try {
      const googleUser = JSON.parse(googleUserInfoCookie.value)
      logger.info("Google user info found", { email: googleUser.email })

      // Return the Google user info (excluding sensitive data)
      return NextResponse.json({
        googleUser: {
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          picture: googleUser.picture,
        },
      })
    } catch (error) {
      logger.error("Error parsing Google user info", { error })
      return NextResponse.json({ googleUser: null })
    }
  } catch (error) {
    logger.error("Unexpected error in check-google-user API", { error })
    return NextResponse.json({ googleUser: null })
  }
}
