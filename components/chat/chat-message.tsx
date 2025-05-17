"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { TwilioMessage } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { MessageAttachment } from "./message-attachment"

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
            {message.media?.map((media) => (
              <div key={media.sid}>
                <MessageAttachment
                  media={media}
                  isCurrentUser={isCurrentUser}
                />
              </div>
            ))}
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
