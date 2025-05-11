import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function GET(request: NextRequest, { params }: { params: { sid: string } }) {
  try {
    const conversationSid = params.sid

    // Get conversation details
    const conversation = await twilioClient.conversations.v1.conversations(conversationSid).fetch()

    // Get participants
    const participants = await twilioClient.conversations.v1.conversations(conversationSid).participants.list()

    return NextResponse.json({
      conversation,
      participants: participants.map((p) => ({
        sid: p.sid,
        identity: p.identity,
      })),
    })
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { sid: string } }) {
  try {
    const conversationSid = params.sid

    // Delete the conversation
    await twilioClient.conversations.v1.conversations(conversationSid).remove()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
