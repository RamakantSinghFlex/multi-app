"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Loader2, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { formatBytes } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (content: string) => void
  conversation: any // Twilio conversation object
  disabled?: boolean
}

export function ChatInput({ onSendMessage, conversation, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [conversation?.sid])

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || disabled) return

    try {
      if (selectedFile) {
        setIsUploading(true)

        // Create form data
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("conversationSid", conversation.sid)

        if (message.trim()) {
          formData.append("body", message.trim())
        }

        // Get token from localStorage
        const token = localStorage.getItem("milestone-token")

        // Send the file to the server
        const response = await fetch("/api/twilio/upload", {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload file")
        }

        // Reset file state
        setSelectedFile(null)
        setPreviewUrl(null)
      } else if (message.trim()) {
        // Just send text message
        onSendMessage(message)
      }

      // Reset message
      setMessage("")

      // Focus the input after sending
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !conversation) return

    const file = files[0]
    setSelectedFile(file)

    // Create preview URL for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const cancelFileSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="flex flex-col border-t">
      {/* File preview */}
      {selectedFile && (
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Attachment Preview</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={cancelFileSelection}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {previewUrl ? (
            <div className="relative rounded-md overflow-hidden">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="max-h-48 max-w-full object-contain bg-gray-100"
              />
            </div>
          ) : (
            <Card className="flex items-center p-3 bg-gray-50">
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedFile.type || "Unknown type"} • {formatBytes(selectedFile.size)}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Message input */}
      <div className="flex items-center gap-2 p-3">
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
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isUploading}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || disabled || isUploading}
          className="bg-[#095d40] hover:bg-[#02342e]"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
