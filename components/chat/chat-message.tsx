"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileText, ImageIcon, Loader2 } from "lucide-react"
import type { TwilioMessage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { formatBytes } from "@/lib/utils"

interface MediaItem {
  sid: string
  filename: string
  contentType: string
  size: number
  url: string
}

interface ChatMessageProps {
  message: TwilioMessage
  isCurrentUser: boolean
  userName?: string
  userAvatar?: string
}

export function ChatMessage({ message, isCurrentUser, userName, userAvatar }: ChatMessageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const hasMedia = message.media && message.media.length > 0
  const media = hasMedia && message.media && message.media.length > 0 ? message.media[0] : null

  const isImage = media && media.contentType?.startsWith("image/")
  const isPdf = media && media.contentType === "application/pdf"
  const isDoc =
    media &&
    (media.contentType === "application/msword" ||
      media.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  const isSpreadsheet =
    media &&
    (media.contentType === "application/vnd.ms-excel" ||
      media.contentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

  const formattedTime = message.dateCreated
    ? formatDistanceToNow(new Date(message.dateCreated), { addSuffix: true })
    : ""

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U"

  const handleDownload = async () => {
    if (!media?.url) return

    try {
      setIsDownloading(true)

      // Fetch the file
      const response = await fetch(media.url)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = media.filename || "download"
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Get file icon based on type
  const getFileIcon = () => {
    if (isPdf || isDoc) return <FileText className="h-5 w-5 text-blue-500" />
    if (isSpreadsheet) return <FileText className="h-5 w-5 text-green-500" />
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  return (
    <div className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {!isCurrentUser && (
        <Avatar className="mr-2 h-8 w-8">
          <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName || "User"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] space-y-1 rounded-lg p-3 ${
          isCurrentUser ? "bg-[#095d40] text-white" : "bg-[#f4f4f4] text-[#000000]"
        }`}
      >
        {message.body && <p className="break-words">{message.body}</p>}

        {hasMedia && (
          <div className="mt-2">
            {isImage && !imageError ? (
              <div className="relative">
                {!imageLoaded && (
                  <div className="flex h-32 w-full items-center justify-center rounded bg-gray-100">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <img
                  src={media?.url || "/placeholder.svg"}
                  alt={media?.filename || "Attachment"}
                  className={`max-h-64 w-auto rounded ${imageLoaded ? "block" : "hidden"}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <Card className="flex items-center justify-between p-2">
                <div className="flex items-center space-x-2">
                  {getFileIcon()}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[180px]">
                      {media?.filename || "Attachment"}
                    </span>
                    {media?.size && <span className="text-xs text-gray-500">{formatBytes(media.size)}</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </Card>
            )}
          </div>
        )}

        <p className={`text-right text-xs ${isCurrentUser ? "text-white/70" : "text-[#858585]"}`}>{formattedTime}</p>
      </div>
    </div>
  )
}
