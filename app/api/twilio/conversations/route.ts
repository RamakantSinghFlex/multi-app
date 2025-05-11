import { NextResponse } from "next/server"
import twilio from "twilio"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// GET handler to retrieve all conversations for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
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
    const session = await getServerSession(authOptions)

    if (!session?.user) {
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
      .participants.create({ identity: session.user.id.toString() })

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
