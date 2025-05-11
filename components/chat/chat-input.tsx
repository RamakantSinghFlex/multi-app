"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  conversation: any // Twilio conversation object
  disabled?: boolean
}

export function ChatInput({ onSendMessage, conversation, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [conversation?.sid])

  const handleSend = () => {
    if (!message.trim() || disabled) return

    onSendMessage(message)
    setMessage("")

    // Focus the input after sending
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !conversation) return

    const file = files[0]
    setIsUploading(true)

    try {
      // Use Twilio SDK directly to upload the file
      const message = await conversation.prepareMessage().addMedia(file).build()

      await message.send()

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
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
    <div className="flex items-center gap-2 border-t p-3">
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
        onClick={handleAttachmentClick}
        disabled={disabled || isUploading}
        className="h-9 w-9"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      </Button>
      <Input
        ref={inputRef}
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="bg-[#095d40] hover:bg-[#02342e]"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
