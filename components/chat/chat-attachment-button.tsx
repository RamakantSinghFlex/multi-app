"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ChatAttachmentButtonProps {
  conversationSid: string
  onAttachmentUploaded: (mediaSid: string, mediaUrl: string) => void
  disabled?: boolean
  twilioConversation: any // Add Twilio conversation object
}

export function ChatAttachmentButton({
  conversationSid,
  onAttachmentUploaded,
  disabled = false,
  twilioConversation,
}: ChatAttachmentButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setIsUploading(true)

    try {
      // Use Twilio SDK directly to upload the file
      // This uses the conversation object passed as a prop
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file directly using the Twilio Conversations SDK
      const message = await twilioConversation.prepareMessage().addMedia(file).build()

      await message.send()

      // Extract media information from the message
      const media = message.media && message.media.length > 0 ? message.media[0] : null

      if (media) {
        onAttachmentUploaded(media.sid, media.url)
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the file.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="h-9 w-9"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      </Button>
    </>
  )
}
