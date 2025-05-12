import { NextResponse } from "next/server"
import twilio from "twilio"
import { getToken } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    // Get the token from the request headers
    const token = getToken()

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract user ID from the request or token
    // This assumes the token contains or can derive a user ID
    // You may need to adjust this based on your token structure
    const userId = typeof window !== "undefined" ? localStorage.getItem("milestone-user-id") : null
    const identity = userId || "anonymous-user"

    // Create an access token
    const AccessToken = twilio.jwt.AccessToken
    const ChatGrant = AccessToken.ChatGrant

    // Create a Chat Grant for this token
    const chatGrant = new ChatGrant({
      serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
    })

    // Create an access token which we will sign and return to the client
    const twilioToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity },
    )

    // Add the chat grant to the token
    twilioToken.addGrant(chatGrant)

    // Serialize the token to a JWT string
    return NextResponse.json({ token: twilioToken.toJwt() })
  } catch (error) {
    console.error("Error generating Twilio token:", error)
    return NextResponse.json({ error: "Failed to generate Twilio token" }, { status: 500 })
  }
}
