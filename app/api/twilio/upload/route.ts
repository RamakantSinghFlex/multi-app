import { NextResponse } from "next/server"
import { Twilio } from "twilio"
import { cookies, headers } from "next/headers"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    console.log("Processing file upload request")

    // Get the form data first to extract any user ID that might be included
    const formData = await request.formData()
    const userIdFromForm = formData.get("userId") as string | null

    // Get the token from cookies or Authorization header - properly awaited
    const cookieStore = cookies()
    const headersList = headers()

    // Try to get token from Authorization header first
    const authHeader = headersList.get("Authorization")
    let token = null
    let userId: string | null = userIdFromForm // Start with user ID from form if available

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7) // Remove "Bearer " prefix
      console.log("Found token in Authorization header")
    } else {
      // Fallback to cookie
      token = cookieStore.get("milestone-token")?.value
      console.log("Looking for token in cookies:", token ? "found" : "not found")

      // If still no token, check localStorage via a custom header
      if (!token) {
        const localStorageToken = headersList.get("X-Local-Storage-Token")
        if (localStorageToken) {
          token = localStorageToken
          console.log("Found token in X-Local-Storage-Token header")
        }
      }
    }

    // If we have a user ID from the form data, we can proceed even without a token
    if (userId) {
      console.log("Using user ID from form data:", userId)
    }
    // Otherwise, try to extract user ID from token
    else if (token) {
      try {
        // First try to verify the token properly
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
            id: string
            email: string
          }
          userId = decoded.id
          console.log("Successfully verified JWT token, user ID:", userId)
        } catch (jwtError) {
          console.warn("JWT verification failed, using fallback method:", jwtError)

          // Fallback: Try to extract user ID directly from token payload without verification
          const decoded = jwt.decode(token) as any

          if (decoded && decoded.id) {
            userId = decoded.id
            console.log("Extracted user ID from decoded token:", userId)
          } else if (decoded && decoded.sub) {
            // Some JWT implementations use 'sub' for the subject (user ID)
            userId = decoded.sub
            console.log("Using 'sub' field from token as user ID:", userId)
          } else {
            console.error("Could not extract user ID from token payload:", decoded)
          }
        }
      } catch (tokenError) {
        console.error("Error processing token:", tokenError)
      }
    }

    // Check for global fallback user ID
    if (!userId) {
      // Try to get user ID from a custom header (set by client-side code)
      const fallbackUserId = headersList.get("X-User-ID")
      if (fallbackUserId) {
        userId = fallbackUserId
        console.log("Using fallback user ID from header:", userId)
      }
    }

    // Final check - if we still don't have a user ID, return 401
    if (!userId) {
      console.error("Could not determine user ID from any source")
      return NextResponse.json({ error: "User ID not found" }, { status: 401 })
    }

    // Process the file upload
    const file = formData.get("file") as File
    const conversationSid = formData.get("conversationSid") as string
    const body = (formData.get("body") as string) || `Sent a file: ${file.name}`

    if (!file || !conversationSid) {
      console.error("Missing required fields:", {
        hasFile: !!file,
        hasConversationSid: !!conversationSid,
      })
      return NextResponse.json({ error: "File and conversation SID are required" }, { status: 400 })
    }

    console.log("Processing file upload:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      conversationSid,
      userId,
    })

    // Initialize Twilio client
    const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID as string, process.env.TWILIO_AUTH_TOKEN as string)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Twilio Media service
    const media = await twilioClient.conversations.v1.conversations(conversationSid).messages.create({
      author: userId,
      body: body,
      media: [buffer],
      mediaFileName: file.name,
      mediaContentType: file.type,
    })

    console.log("File uploaded successfully to Twilio:", {
      messageSid: media.sid,
      mediaUrl: media.mediaUrl,
    })

    // Return the media URL
    return NextResponse.json({
      success: true,
      mediaUrl: media.mediaUrl,
      messageSid: media.sid,
    })
  } catch (error) {
    console.error("Error uploading file to Twilio:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
