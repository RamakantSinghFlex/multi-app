import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Forward the request to the PayloadCMS Stripe endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/stripe/verify-payment?session_id=${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
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
