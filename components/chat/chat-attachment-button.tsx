"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ChatAttachmentButtonProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  isUploading?: boolean
}

export function ChatAttachmentButton({
  onFileSelect,
  disabled = false,
  isUploading = false,
}: ChatAttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const fileSize = Math.round(file.size / 1024) // Size in KB

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: `File size (${fileSize}KB) exceeds 10MB limit.`,
        variant: "destructive",
      })
      return
    }

    // Pass the file to parent component instead of automatically uploading
    onFileSelect(file)

    toast({
      title: "File selected",
      description: `${file.name} (${fileSize}KB) selected. Click send to upload.`,
    })

    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </Button>
    </>
  )
}
