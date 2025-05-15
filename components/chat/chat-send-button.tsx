"use client"

import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ChatSendButtonProps {
  onClick: () => void
  disabled: boolean
  hasFile?: boolean
}

export function ChatSendButton({
  onClick,
  disabled,
  hasFile,
}: ChatSendButtonProps) {
  return (
    <Button
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="bg-[#095d40] hover:bg-[#02342e]"
    >
      <Send className="h-4 w-4" />
      {hasFile && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
        </span>
      )}
    </Button>
  )
}
