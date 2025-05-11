import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function GET(request: NextRequest, { params }: { params: { sid: string } }) {
  try {
    const conversationSid = params.sid

    // Get messages for a conversation
    const messages = await twilioClient.conversations.v1.conversations(conversationSid).messages.list({ limit: 100 })

    return NextResponse.json({
      messages: messages.map((message) => ({
        sid: message.sid,
        author: message.author,
        body: message.body,
        dateCreated: message.dateCreated,
        media: message.media?.map((m) => ({
          sid: m.sid,
          filename: m.filename,
          contentType: m.contentType,
          size: m.size,
          url: m.url,
        })),
      })),
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { sid: string } }) {
  try {
    const conversationSid = params.sid
    const formData = await request.formData()

    const body = formData.get("body") as string
    const author = formData.get("author") as string
    const file = formData.get("file") as File

    if (!body && !file) {
      return NextResponse.json({ error: "Message body or file is required" }, { status: 400 })
    }

    const messageOptions: any = {
      author,
      body: body || "",
    }

    // If a file is included, upload it to Twilio Media
    if (file) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const mediaResponse = await twilioClient.conversations.v1.conversations(conversationSid).messages.create({
        author,
        body: body || "",
        mediaSid: await uploadMediaToTwilio(buffer, file.type, file.name),
      })

      return NextResponse.json({ message: mediaResponse })
    }

    // Send a regular text message
    const message = await twilioClient.conversations.v1.conversations(conversationSid).messages.create(messageOptions)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

// Helper function to upload media to Twilio
async function uploadMediaToTwilio(buffer: Buffer, contentType: string, filename: string): Promise<string> {
  // This is a placeholder - you would need to implement the actual media upload
  // using Twilio's Media API. This typically involves:
  // 1. Creating a media resource
  // 2. Uploading the file content
  // 3. Returning the media SID

  // For now, we'll throw an error to indicate this needs implementation
  throw new Error("Media upload not implemented")
}
