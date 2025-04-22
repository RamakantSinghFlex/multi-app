import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "@/lib/config"

export async function GET(request: Request) {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get payment methods using Stripe REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/stripe/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        stripeMethod: "stripe.paymentMethods.list",
        stripeArgs: [{ type: "card", limit: 10 }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch payment methods" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
