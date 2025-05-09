"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { ChatAttachmentButton } from "./chat-attachment-button"

interface ChatInputProps {
  onSendMessage: (content: string, mediaSid?: string) => void
  conversationSid: string
  disabled?: boolean
}

export function ChatInput({ onSendMessage, conversationSid, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [pendingMediaSid, setPendingMediaSid] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [conversationSid])

  const handleSend = () => {
    if ((!message.trim() && !pendingMediaSid) || disabled) return

    onSendMessage(message, pendingMediaSid || undefined)
    setMessage("")
    setPendingMediaSid(null)

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

  const handleAttachmentUploaded = (mediaSid: string) => {
    setPendingMediaSid(mediaSid)
  }

  return (
    <div className="flex items-center gap-2 border-t p-3">
      <ChatAttachmentButton
        conversationSid={conversationSid}
        onAttachmentUploaded={handleAttachmentUploaded}
        disabled={disabled}
      />
      <Input
        ref={inputRef}
        placeholder={pendingMediaSid ? "Add a message (optional)..." : "Type a message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={pendingMediaSid ? "border-green-500" : ""}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={(!message.trim() && !pendingMediaSid) || disabled}
        className="bg-[#095d40] hover:bg-[#02342e]"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
