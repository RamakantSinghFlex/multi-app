import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stripeMethod, stripeArgs } = body

    // Get the auth token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Forward the request to the PayloadCMS Stripe REST endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/stripe/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        method: stripeMethod,
        args: stripeArgs,
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
    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
