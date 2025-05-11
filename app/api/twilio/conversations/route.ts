import { NextResponse } from "next/server"
import twilio from "twilio"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Helper function to get the authenticated user from the token
async function getAuthenticatedUser(req: Request) {
  try {
    // Get the token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("milestone-token")?.value

    if (!token) {
      return null
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string; email: string }

    if (!decoded || !decoded.id) {
      return null
    }

    return { id: decoded.id, email: decoded.email }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

// GET handler to retrieve all conversations for the current user
export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const identity = userId.toString()

    // Get all conversations the user participates in
    const userConversations = await twilioClient.conversations.v1.participantConversations.list({ identity })

    // Format the response
    const conversations = await Promise.all(
      userConversations.map(async (participantConversation) => {
        const conversationSid = participantConversation.conversationSid
        const conversation = await twilioClient.conversations.v1.conversations(conversationSid).fetch()

        // Get the last message if it exists
        let lastMessage
        try {
          const messages = await twilioClient.conversations.v1
            .conversations(conversationSid)
            .messages.list({ limit: 1 })

          lastMessage = messages[0]?.body
        } catch (error) {
          console.error("Error fetching last message:", error)
        }

        return {
          sid: conversation.sid,
          friendlyName: conversation.friendlyName || "Unnamed Conversation",
          lastMessage: lastMessage,
        }
      }),
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

// POST handler to create a new conversation
export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { participants, friendlyName } = await request.json()

    // Create a new conversation
    const conversation = await twilioClient.conversations.v1.conversations.create({
      friendlyName: friendlyName || `Conversation ${new Date().toISOString()}`,
    })

    // Add the current user as a participant
    await twilioClient.conversations.v1
      .conversations(conversation.sid)
      .participants.create({ identity: user.id.toString() })

    // Add other participants
    for (const participant of participants) {
      await twilioClient.conversations.v1.conversations(conversation.sid).participants.create({ identity: participant })
    }

    return NextResponse.json({ conversationSid: conversation.sid })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
