import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Verify payment status using Stripe REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/stripe/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        stripeMethod: "stripe.checkout.sessions.retrieve",
        stripeArgs: [sessionId, { expand: ["payment_intent"] }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to verify payment" }, { status: response.status })
    }

    const sessionData = await response.json()

    // Extract payment status and appointment ID from session data
    const paymentStatus = sessionData.payment_status
    const appointmentId = sessionData.metadata?.appointmentId

    let status = "pending"
    if (paymentStatus === "paid") {
      status = "complete"
    } else if (paymentStatus === "unpaid") {
      status = "pending"
    } else {
      status = "failed"
    }

    return NextResponse.json({
      status,
      appointmentId,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
