import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logger } from "@/lib/monitoring"
import { API_URL } from "@/lib/config"
import { ObjectId } from "bson"

export async function POST(request: NextRequest) {
  try {
    logger.info("Creating user from Google OAuth data")

    // Get the Google user info from the cookie
    const cookieStore = await cookies()
    const googleUserInfoCookie = cookieStore.get("google_user_info")

    if (!googleUserInfoCookie) {
      logger.error("No Google user info cookie found")
      return NextResponse.json({ error: "No Google user info found. Please try again." }, { status: 400 })
    }

    // Parse the Google user info
    let googleUserInfo
    try {
      googleUserInfo = JSON.parse(googleUserInfoCookie.value)
    } catch (error) {
      logger.error("Error parsing Google user info", { error })
      return NextResponse.json({ error: "Invalid Google user info. Please try again." }, { status: 400 })
    }

    // Get the role from the request body
    const { role } = await request.json()

    if (!role || (role !== "parent" && role !== "tutor")) {
      logger.error("Invalid role provided", { role })
      return NextResponse.json({ error: "Invalid role. Please select either 'parent' or 'tutor'." }, { status: 400 })
    }

    // Generate a secure password for the user
    const securePassword = `google-oauth-${googleUserInfo.googleId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

    // Create the user in PayloadCMS
    const userData = {
      email: googleUserInfo.email,
      password: securePassword,
      firstName: googleUserInfo.firstName || "",
      lastName: googleUserInfo.lastName || "",
      role: role,
      googleId: googleUserInfo.googleId,
      profileImage: googleUserInfo.picture || "",
      tenants: [
        {
          id: new ObjectId(),
          tenant: "67e96de1c71e8d565d305a82",
        },
      ],
    }

    // For development mode without API
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_PAYLOAD_API_URL) {
      logger.info("DEV MODE: Simulating user creation", { email: googleUserInfo.email, role })

      // Simulate successful user creation
      const mockToken = `mock-jwt-token-${Date.now()}`

      // Set the JWT token in a cookie
      cookieStore.set("milestone-token", mockToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      // Clear the Google user info cookie
      cookieStore.delete("google_user_info")

      return NextResponse.json({
        success: true,
        user: {
          ...userData,
          id: "mock-user-id",
        },
        token: mockToken,
      })
    }

    // Create the user in PayloadCMS
    try {
      const createUserResponse = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      })

      if (!createUserResponse.ok) {
        const errorData = await createUserResponse.json()
        logger.error("Error creating user", { error: errorData })
        return NextResponse.json(
          { error: errorData.message || "Error creating user. Please try again." },
          { status: createUserResponse.status },
        )
      }

      const createUserData = await createUserResponse.json()
      logger.info("User created successfully", { email: googleUserInfo.email, role })

      // Now log in the user
      const loginResponse = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: googleUserInfo.email,
          password: securePassword,
        }),
        credentials: "include",
      })

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json()
        logger.error("Error logging in after creating user", { error: errorData })
        return NextResponse.json(
          { error: "User created but login failed. Please try logging in manually." },
          { status: loginResponse.status },
        )
      }

      const loginData = await loginResponse.json()

      // Set the JWT token in a cookie
      if (loginData.token) {
        cookieStore.set("milestone-token", loginData.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: "/",
        })
      }

      // Clear the Google user info cookie
      cookieStore.delete("google_user_info")

      return NextResponse.json({
        success: true,
        user: loginData.user,
        token: loginData.token,
      })
    } catch (error) {
      logger.error("Unexpected error creating user", { error })
      return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
    }
  } catch (error) {
    logger.error("Unexpected error in create-google-user API", { error })
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
