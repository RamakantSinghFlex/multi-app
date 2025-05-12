import { NextResponse } from "next/server"
import twilio from "twilio"
import { getToken } from "@/lib/api-utils"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// GET handler to retrieve messages for a specific conversation
export async function GET(request: Request, { params }: { params: { sid: string } }) {
  try {
    const token = getToken()

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversationSid = params.sid

    // Get the URL parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const order = url.searchParams.get("order") || "desc"

    // Get messages for the conversation
    const messages = await twilioClient.conversations.v1
      .conversations(conversationSid)
      .messages.list({ limit, order: order as "asc" | "desc" })

    // Format the messages
    const formattedMessages = messages.map((message) => ({
      sid: message.sid,
      author: message.author,
      body: message.body,
      dateCreated: message.dateCreated,
      media: message.media?.map((m) => ({
        sid: m.sid,
        contentType: m.contentType,
        filename: m.filename,
        size: m.size,
        url: m.url,
      })),
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST handler to send a message to a conversation
export async function POST(request: Request, { params }: { params: { sid: string } }) {
  try {
    const token = getToken()

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract user ID from the request or token
    // This assumes the token contains or can derive a user ID
    // You may need to adjust this based on your token structure
    const userId = typeof window !== "undefined" ? localStorage.getItem("milestone-user-id") : null

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 })
    }

    const conversationSid = params.sid
    const { body, mediaSid } = await request.json()

    // Create message options
    const messageOptions: any = {
      author: userId.toString(),
      body: body || "",
    }

    // Add media if provided
    if (mediaSid) {
      messageOptions.mediaSid = mediaSid
    }

    // Send the message
    const message = await twilioClient.conversations.v1.conversations(conversationSid).messages.create(messageOptions)

    return NextResponse.json({
      sid: message.sid,
      author: message.author,
      body: message.body,
      dateCreated: message.dateCreated,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
