import { NextResponse } from "next/server"
import twilio from "twilio"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// POST handler to upload an attachment to a conversation
export async function POST(request: Request, { params }: { params: { sid: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversationSid = params.sid

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the media to Twilio
    const media = await twilioClient.conversations.v1.conversations(conversationSid).messages.create({
      author: session.user.id.toString(),
      body: file.name,
      media: [
        {
          contentType: file.type,
          filename: file.name,
          content: buffer,
        },
      ],
    })

    // Get the media URL
    const mediaItems = media.media || []
    const mediaUrl = mediaItems.length > 0 ? mediaItems[0].url : null
    const mediaSid = mediaItems.length > 0 ? mediaItems[0].sid : null

    return NextResponse.json({
      mediaUrl,
      mediaSid,
      messageSid: media.sid,
    })
  } catch (error) {
    console.error("Error uploading attachment:", error)
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 })
  }
}
