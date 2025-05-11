import { NextResponse } from "next/server"
import twilio from "twilio"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    // Get the token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("milestone-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { id: string; email: string }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const conversationSid = formData.get("conversationSid") as string

    if (!file || !conversationSid) {
      return NextResponse.json({ error: "Missing file or conversation SID" }, { status: 400 })
    }

    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the file to Twilio Media
    const media = await client.conversations.v1.conversations(conversationSid).messages.create({
      author: decoded.id,
      body: `Uploaded file: ${file.name}`,
      media: [buffer],
      contentType: file.type,
    })

    // Return the media URL
    return NextResponse.json({
      success: true,
      mediaUrl: media.mediaUrl,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
