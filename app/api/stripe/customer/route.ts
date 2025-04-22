import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const body = await request.json()
    const { email, name, metadata } = body

    // Create customer using Stripe REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/stripe/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        stripeMethod: "stripe.customers.create",
        stripeArgs: [
          {
            email,
            name,
            metadata: metadata || {},
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to create customer" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
