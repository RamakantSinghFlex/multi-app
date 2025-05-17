"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Image as ImageIcon, Download, Eye } from "lucide-react"
import { ChatImagePreview } from "./chat-image-preview"
import { TwilioMedia } from "@/lib/types"

interface MessageAttachmentProps {
  media: TwilioMedia
  isCurrentUser?: boolean
}

export function MessageAttachment({
  media,
  isCurrentUser = false,
}: MessageAttachmentProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const isImage = media.contentType?.startsWith("image/")

  const handleImageLoad = () => {
    setIsLoaded(true)
  }

  const handleImageError = () => {
    setHasError(true)
  }

  // Ensure the URL includes domain if it's a relative URL
  const fullMediaUrl = media.url?.startsWith("http")
    ? media.url
    : window.location.origin + (media.url || "/placeholder.svg")

  return (
    <>
      {isImage && !hasError ? (
        <div className="relative group">
          {!isLoaded && (
            <div
              className="flex h-32 w-full items-center justify-center rounded bg-gray-100"
              aria-label="Loading image"
            >
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <img
            src={fullMediaUrl}
            alt={media.filename || "Attachment"}
            className={`max-h-64 w-auto rounded cursor-pointer transition-all ${
              isLoaded ? "block" : "hidden"
            } ${isCurrentUser ? "bg-[#063e2a]/20" : "bg-gray-100/30"}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={() => setIsPreviewOpen(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded">
            <Button
              variant="secondary"
              size="sm"
              className="mr-2"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const link = document.createElement("a")
                link.href = fullMediaUrl
                link.download = media.filename || "download"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>
      ) : (
        <Card className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium truncate max-w-[150px]">
              {media.filename || "Attachment"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => window.open(fullMediaUrl, "_blank")}
          >
            <Download className="h-4 w-4" />
          </Button>
        </Card>
      )}

      <ChatImagePreview
        media={isPreviewOpen ? media : null}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  )
}
