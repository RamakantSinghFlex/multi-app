import { NextResponse } from "next/server"
import twilio from "twilio"
import jwt from "jsonwebtoken"

// Initialize Twilio Access Token builder
const { AccessToken } = twilio.jwt
const { ChatGrant } = AccessToken

export async function GET(request: Request) {
  try {
    console.log("Twilio token request received")

    // Parse the URL to get query parameters
    const url = new URL(request.url)

    // Get the token from the Authorization header
    const authHeader = request.headers.get("authorization")
    const token = authHeader ? authHeader.replace("Bearer ", "") : null

    // Get userId from query parameter as fallback
    const userId = url.searchParams.get("userId")

    console.log("Auth info:", {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      hasUserId: !!userId,
      requestOrigin: request.headers.get("origin"),
      requestReferer: request.headers.get("referer"),
    })

    // Ensure TWILIO config is available
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_API_KEY ||
      !process.env.TWILIO_API_SECRET ||
      !process.env.TWILIO_CONVERSATIONS_SERVICE_SID
    ) {
      console.error("Missing Twilio environment variables", {
        hasTwilioAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasTwilioApiKey: !!process.env.TWILIO_API_KEY,
        hasTwilioApiSecret: !!process.env.TWILIO_API_SECRET,
        hasTwilioConversationsServiceSid: !!process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
      })
      return NextResponse.json(
        {
          error: "Twilio configuration is incomplete",
        },
        { status: 500 },
      )
    }

    // Try to get the user ID from the token or use the provided userId
    let identity: string

    // First try to use the token if available
    if (token) {
      try {
        console.log("Attempting to verify JWT token")
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string; email: string }

        if (decoded && decoded.id) {
          identity = decoded.id.toString()
          console.log("Successfully verified JWT token, using ID:", identity)
        } else {
          throw new Error("Invalid token payload - missing id")
        }
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError)

        // If userId is provided as fallback, use it
        if (userId) {
          identity = userId
          console.log("Using fallback userId:", userId)
        } else {
          console.error("No fallback userId provided")
          return NextResponse.json(
            {
              error: "Invalid token and no userId fallback provided",
            },
            { status: 401 },
          )
        }
      }
    }
    // If no token but userId is provided, use userId directly
    else if (userId) {
      identity = userId
      console.log("No token provided, using userId directly:", userId)
    }
    // No authentication method available
    else {
      console.error("No authentication method available")
      return NextResponse.json(
        {
          error: "Unauthorized - No token or userId provided",
        },
        { status: 401 },
      )
    } // Sanitize identity - Twilio has specific rules for identity strings
    // Remove any characters that might cause issues with Twilio
    const sanitizedIdentity = identity.toString().replace(/[^a-zA-Z0-9_.-]/g, "_")

    console.log("Sanitized identity:", sanitizedIdentity)

    try {
      // Create a Chat Grant for this token with specific permissions to address sync errors
      const chatGrant = new ChatGrant({
        serviceSid: process.env.TWILIO_CONVERSATIONS_SERVICE_SID,
      })

      // Create an access token with additional options
      const twilioToken = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_API_KEY!,
        process.env.TWILIO_API_SECRET!,
        {
          identity: sanitizedIdentity,
          ttl: 3600 * 12, // 12 hour expiration
        },
      )

      // Add the chat grant to the token
      twilioToken.addGrant(chatGrant)

      // Generate the token string
      const tokenString = twilioToken.toJwt()
      console.log("Successfully generated Twilio token for identity:", sanitizedIdentity)

      // Log token details for debugging (not the full token for security)
      console.log("Token info:", {
        generatedAt: new Date().toISOString(),
        expiresIn: "12 hours",
      })

      return NextResponse.json({
        token: tokenString,
        identity: sanitizedIdentity,
      })
    } catch (tokenGenError) {
      console.error("Error generating Twilio access token:", tokenGenError)
      return NextResponse.json(
        {
          error: "Failed to generate Twilio access token",
          details: tokenGenError instanceof Error ? tokenGenError.message : String(tokenGenError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing token request:", error)
    return NextResponse.json(
      {
        error: "Failed to process token request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
