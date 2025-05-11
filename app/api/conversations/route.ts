import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get all conversations for a user
    const conversations = await twilioClient.conversations.v1.participantConversations.list({
      identity: userId,
    })

    // Get details for each conversation
    const conversationDetails = await Promise.all(
      conversations.map(async (conv) => {
        const conversation = await twilioClient.conversations.v1.conversations(conv.conversationSid).fetch()

        // Get the last message if available
        let lastMessage = null
        try {
          const messages = await twilioClient.conversations.v1
            .conversations(conv.conversationSid)
            .messages.list({ limit: 1 })

          if (messages.length > 0) {
            lastMessage = messages[0].body
          }
        } catch (error) {
          console.error("Error fetching last message:", error)
        }

        return {
          sid: conversation.sid,
          friendlyName: conversation.friendlyName,
          dateUpdated: conversation.dateUpdated,
          lastMessage,
        }
      }),
    )

    return NextResponse.json({ conversations: conversationDetails })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { friendlyName, participants } = body

    if (!friendlyName || !participants || !participants.length) {
      return NextResponse.json({ error: "Friendly name and participants are required" }, { status: 400 })
    }

    // Create a new conversation
    const conversation = await twilioClient.conversations.v1.conversations.create({
      friendlyName,
    })

    // Add participants to the conversation
    await Promise.all(
      participants.map((participant: string) =>
        twilioClient.conversations.v1.conversations(conversation.sid).participants.create({ identity: participant }),
      ),
    )

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
