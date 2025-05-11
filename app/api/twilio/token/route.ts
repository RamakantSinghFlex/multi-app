import { NextResponse } from "next/server"
import twilio from "twilio"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const identity = userId.toString()

    // Create an access token
    const AccessToken = twilio.jwt.AccessToken
    const ChatGrant = AccessToken.ChatGrant

    // Create a Chat Grant for this token
    const chatGrant = new ChatGrant({
      serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
    })

    // Create an access token which we will sign and return to the client
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity },
    )

    // Add the chat grant to the token
    token.addGrant(chatGrant)

    // Serialize the token to a JWT string
    return NextResponse.json({ token: token.toJwt() })
  } catch (error) {
    console.error("Error generating Twilio token:", error)
    return NextResponse.json({ error: "Failed to generate Twilio token" }, { status: 500 })
  }
}
