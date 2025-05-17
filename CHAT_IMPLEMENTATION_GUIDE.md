# Chat Attachment Implementation Guide

## Overview

This document summarizes the implementation of the chat attachment feature across the multi-app platform (Flexforce2), which allows students, parents, and tutors to send files in their conversations.

## Implemented Components

### 1. API Routes

- **`/api/messages/send`**: Primary API route that handles message sending with attachments
- **`/api/messages/send-with-attachment`**: Backup API route as a fallback for file uploads
- **`/api/twilio/upload`**: Legacy API endpoint (kept for backward compatibility)

### 2. Enhanced Hooks

- Updated `use-twilio-conversation.ts` with improved file upload handling:
  - Attempts direct Twilio SDK upload first
  - Falls back to API routes if SDK upload fails
  - Handles errors with meaningful messages

### 3. UI Components

- Added `FileAttachmentPreview` component to display selected files before sending

## Implementation Details

### API Route (`/api/messages/send`)

```typescript
// Handles both text messages and file attachments
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const body = formData.get("body") as string
  const identity = formData.get("identity") as string
  const conversationSid = formData.get("conversationSid") as string
  const file = formData.get("file") as File | null

  // Initialize Twilio client
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )

  // Prepare message options
  const messageOptions = { body, author: identity }

  // Process file if present
  if (file) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mediaUrl = `data:${file.type};base64,${buffer.toString("base64")}`
    messageOptions.media = [mediaUrl]
  }

  // Send message
  const message = await twilioClient.conversations.v1
    .conversations(conversationSid)
    .messages.create(messageOptions)

  return NextResponse.json({ success: true, messageSid: message.sid })
}
```

### Enhanced send message logic

```typescript
const sendFileMessage = async (body: string, file: File) => {
  if (!conversation) return

  try {
    // Try direct SDK upload first
    try {
      let messageBuilder = conversation.prepareMessage()
      messageBuilder = messageBuilder.setBody(body.trim())
      messageBuilder = messageBuilder.addMedia(file)
      const mediaMessage = await messageBuilder.build()
      await mediaMessage.send()
    } catch (directError) {
      // Fall back to API endpoint
      const formData = new FormData()
      formData.append("file", file)
      formData.append("conversationSid", conversation.sid)
      formData.append("body", body || `Sent a file: ${file.name}`)
      formData.append("identity", identity)

      const uploadResponse = await fetch("/api/messages/send", {
        method: "POST",
        body: formData,
      })

      // Handle response
      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }
    }
  } catch (err) {
    // Error handling
    console.error("Error sending file message:", err)
    setError(err instanceof Error ? err.message : "Failed to send file message")
  }
}
```

## Implementation Status

### Completed

- ✅ Created API routes for handling attachments
- ✅ Updated `use-twilio-conversation.ts` with enhanced file handling
- ✅ Updated tutor message page with attachment support
- ✅ Created helper component for file preview (`FileAttachmentPreview`)

### In Progress / Pending

- 🟠 Fix parent message page formatting issues
- 🟠 Fix student message page formatting issues
- ⬜ Add upload progress indicator for better user feedback
- ⬜ Test implementation across all three user types

## Integration Steps for Student & Parent Pages

1. **Import the FileAttachmentPreview component**

```typescript
import { FileAttachmentPreview } from "@/components/file-attachment-preview"
```

2. **Add upload progress state**

```typescript
const [uploadProgress, setUploadProgress] = useState(0)
```

3. **Enhance the message sending function**

```typescript
const handleSendMessage = async () => {
  if (!selectedConversation) return
  if (!selectedFile && !messageText.trim()) return

  try {
    setIsUploading(true)

    if (selectedFile) {
      // Try API endpoint first
      try {
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("conversationSid", selectedConversation.sid)
        formData.append("identity", user?.id?.toString() || "unknown-user")
        formData.append(
          "body",
          messageText.trim() || `Sent a file: ${selectedFile.name}`
        )

        // Get auth token
        const token =
          localStorage.getItem("milestone-token") ||
          localStorage.getItem("auth_token")

        // Upload with progress tracking
        const xhr = new XMLHttpRequest()
        xhr.open("POST", "/api/messages/send", true)

        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        }

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            setUploadProgress(percentComplete)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Success
            setSelectedFile(null)
            setMessageText("")
            setUploadProgress(0)
          } else {
            throw new Error(`Upload failed: ${xhr.status}`)
          }
        }

        xhr.onerror = () => {
          throw new Error("Network error during upload")
        }

        xhr.send(formData)
      } catch (apiError) {
        // Fall back to SDK method
        // [SDK fallback code here]
      }
    } else {
      // Send text-only message
      await selectedConversation.sendMessage(messageText.trim())
      setMessageText("")
    }
  } catch (error) {
    console.error("Error sending message:", error)
    toast({
      title: "Error",
      description: "Failed to send message",
      variant: "destructive",
    })
  } finally {
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }
}
```

4. **Update the UI to show file preview**

```tsx
{
  /* File preview */
}
{
  selectedFile && (
    <FileAttachmentPreview
      file={selectedFile}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      onRemove={() => setSelectedFile(null)}
    />
  )
}
```

## Testing Instructions

1. Log in as each user type (student, parent, tutor)
2. Test sending text-only messages
3. Test sending image attachments
4. Test sending document attachments (PDF, Word, etc.)
5. Verify attachments display correctly for both sender and receiver
6. Test error handling by temporarily disabling network access

## Future Enhancements

1. Add support for multiple file attachments in one message
2. Implement file type validation and better error messages
3. Add image previews for received attachments
4. Consider implementing compression for large images before upload
