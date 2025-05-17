import type { NextRequest } from "next/server"
import twilio from "twilio"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const body = formData.get("body") as string
    const identity = formData.get("identity") as string
    const conversationSid = formData.get("conversationSid") as string
    const file = formData.get("file") as File | null

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    const messageOptions: any = {
      body,
      author: identity,
    }

    if (file) {
      // Convert file to buffer for Twilio
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Create a media URL
      const mediaUrl = `data:${file.type};base64,${buffer.toString("base64")}`
      messageOptions.media = [mediaUrl]
    }

    // Send the message
    const message = await twilioClient.conversations.v1
      .conversations(conversationSid)
      .messages.create(messageOptions)

    return NextResponse.json({ success: true, messageSid: message.sid })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
