import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const body = await request.json()
    const { stripeMethod, stripeArgs } = body

    // Forward the request to the PayloadCMS Stripe REST endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/stripe/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        method: stripeMethod,
        args: stripeArgs,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to verify payment" }, { status: response.status })
    }

    const { data } = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
