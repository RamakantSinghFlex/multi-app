import { NextResponse } from "next/server"
import twilio from "twilio"
import { getToken } from "@/lib/api-utils"

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// POST handler to upload an attachment to a conversation
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
      author: userId.toString(),
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
