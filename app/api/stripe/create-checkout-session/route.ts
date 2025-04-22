import { NextResponse } from "next/server"
import { APP_URL } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const body = await request.json()
    const { appointmentId, title, price, tutorIds, studentIds, startTime, endTime, notes } = body

    // Format the appointment data for the API
    const appointmentData = {
      id: appointmentId,
      title,
      price,
      tutorIds,
      studentIds,
      startTime,
      endTime,
      notes,
    }

    // Forward the request to the PayloadCMS Stripe endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/api/stripe/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        appointment: appointmentData,
        successUrl: `${APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${APP_URL}/payment/cancel`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to create checkout session" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
