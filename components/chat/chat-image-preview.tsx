"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { TwilioMedia } from "@/lib/types"

interface ChatImagePreviewProps {
  media: TwilioMedia | null
  isOpen: boolean
  onClose: () => void
}

export function ChatImagePreview({
  media,
  isOpen,
  onClose,
}: ChatImagePreviewProps) {
  const [fullImageUrl, setFullImageUrl] = useState<string>("")

  useEffect(() => {
    if (media && media.url) {
      // Make sure we have the full URL with domain
      setFullImageUrl(
        media.url.startsWith("http")
          ? media.url
          : window.location.origin + media.url
      )
    }
  }, [media])

  // Download function
  const handleDownload = () => {
    if (!fullImageUrl) return
    
    const link = document.createElement("a")
    link.href = fullImageUrl
    link.download = media?.filename || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!media) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold truncate">
            {media.filename || "Image Preview"}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex items-center justify-center h-full">
          <img
            src={fullImageUrl}
            alt={media.filename || "Preview"}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
