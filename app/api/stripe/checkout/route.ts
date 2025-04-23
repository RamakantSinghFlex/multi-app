import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const body = await request.json()
    const { appointmentData } = body

    // Format line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: appointmentData.title,
            description: `Appointment from ${new Date(appointmentData.startTime).toLocaleString()} to ${new Date(
              appointmentData.endTime,
            ).toLocaleString()}`,
            metadata: {
              appointmentId: appointmentData.appointmentId,
            },
          },
          unit_amount: Math.round(appointmentData.price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ]

    // Create metadata for the session
    const metadata = {
      appointmentId: appointmentData.appointmentId || "",
      tutorIds: appointmentData.tutorIds && appointmentData.tutorIds.join(","),
      studentIds: appointmentData.studentIds && appointmentData.studentIds.join(","),
      parentIds: appointmentData.parentIds && appointmentData.parentIds.join(","),
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      notes: appointmentData.notes || "",
    }

    // Create checkout session using Stripe REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_API_URL}/stripe/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        stripeMethod: "checkout.sessions.create",
        stripeArgs: [
          {
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
            metadata,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to create checkout session" },
        { status: response.status },
      )
    }

    const { data } = await response.json()
    return NextResponse.json({ url: data.url || `https://checkout.stripe.com/pay/${data.id}` })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
