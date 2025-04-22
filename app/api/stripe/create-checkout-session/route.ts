import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME, APP_URL } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { appointmentId, title, price, tutorIds, studentIds, startTime, endTime, notes } = body

    // Get the auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

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
        Authorization: `JWT ${token}`,
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
