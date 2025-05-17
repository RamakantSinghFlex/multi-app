"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileText, ImageIcon } from "lucide-react"
import type { TwilioMessage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ChatMessageProps {
  message: TwilioMessage
  isCurrentUser: boolean
  userName?: string
  userAvatar?: string
}

export function ChatMessage({
  message,
  isCurrentUser,
  userName,
  userAvatar,
}: ChatMessageProps) {
  const [imageLoadedMap, setImageLoadedMap] = useState<Record<string, boolean>>(
    {}
  )
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>(
    {}
  )

  const hasMedia = message.media && message.media.length > 0

  const formattedTime = message.dateCreated
    ? formatDistanceToNow(new Date(message.dateCreated), { addSuffix: true })
    : ""

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U"

  const handleImageLoad = (mediaSid: string) => {
    setImageLoadedMap((prev) => ({ ...prev, [mediaSid]: true }))
  }

  const handleImageError = (mediaSid: string) => {
    setImageErrorMap((prev) => ({ ...prev, [mediaSid]: true }))
  }

  return (
    <div
      className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      {!isCurrentUser && (
        <Avatar className="mr-2 h-8 w-8">
          <AvatarImage
            src={userAvatar || "/placeholder.svg"}
            alt={userName || "User"}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] space-y-1 rounded-lg p-3 ${
          isCurrentUser
            ? "bg-[#095d40] text-white"
            : "bg-[#f4f4f4] text-[#000000]"
        }`}
      >
        {message.body && <p className="break-words">{message.body}</p>}

        {hasMedia && (
          <div className="mt-2 space-y-2">
            {message.media?.map((media) => {
              const isImage = media.contentType?.startsWith("image/")
              const isLoaded = imageLoadedMap[media.sid]
              const hasError = imageErrorMap[media.sid]

              return (
                <div key={media.sid}>
                  {isImage && !hasError ? (
                    <div className="relative">
                      {!isLoaded && (
                        <div className="flex h-32 w-full items-center justify-center rounded bg-gray-100">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt={media.filename || "Attachment"}
                        className={`max-h-64 w-auto rounded ${isLoaded ? "block" : "hidden"}`}
                        onLoad={() => handleImageLoad(media.sid)}
                        onError={() => handleImageError(media.sid)}
                      />
                    </div>
                  ) : (
                    <Card className="flex items-center justify-between p-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium">
                          {media.filename || "Attachment"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          media?.url && window.open(media.url, "_blank")
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </Card>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p
          className={`text-right text-xs ${isCurrentUser ? "text-white/70" : "text-[#858585]"}`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  )
}
