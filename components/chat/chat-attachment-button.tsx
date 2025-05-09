"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Loader2 } from "lucide-react"
import { uploadAttachment } from "@/lib/api/twilio"
import { toast } from "@/components/ui/use-toast"

interface ChatAttachmentButtonProps {
  conversationSid: string
  onAttachmentUploaded: (mediaSid: string, mediaUrl: string) => void
  disabled?: boolean
}

export function ChatAttachmentButton({
  conversationSid,
  onAttachmentUploaded,
  disabled = false,
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
      const response = await uploadAttachment(conversationSid, file)

      if (response.error) {
        toast({
          title: "Upload failed",
          description: response.error,
          variant: "destructive",
        })
        return
      }

      if (response.data) {
        const { mediaSid, mediaUrl } = response.data
        onAttachmentUploaded(mediaSid, mediaUrl)
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        })
      }
    } catch (error) {
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
