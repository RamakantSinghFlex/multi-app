"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Paperclip } from "lucide-react"

interface ChatFileButtonProps {
  onClick: () => void
  disabled: boolean
  isUploading: boolean
}

export function ChatFileButton({
  onClick,
  disabled,
  isUploading,
}: ChatFileButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled || isUploading}
      className="h-9 w-9"
    >
      {isUploading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Paperclip className="h-4 w-4" />
      )}
    </Button>
  )
}
