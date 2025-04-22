import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "@/lib/config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Get the auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Forward the request to the PayloadCMS Stripe endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/stripe/verify-payment?session_id=${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `JWT ${token}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to verify payment" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
