import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationSid = searchParams.get("conversationSid")

    if (!conversationSid) {
      return NextResponse.json({ error: "Conversation SID is required" }, { status: 400 })
    }

    // Get messages for a conversation
    const messages = await twilioClient.conversations.v1.conversations(conversationSid).messages.list({ limit: 100 })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationSid, message, userId } = body

    if (!conversationSid || !message) {
      return NextResponse.json({ error: "Conversation SID and message are required" }, { status: 400 })
    }

    // Send a message to a conversation
    const newMessage = await twilioClient.conversations.v1.conversations(conversationSid).messages.create({
      author: userId,
      body: message,
    })

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
