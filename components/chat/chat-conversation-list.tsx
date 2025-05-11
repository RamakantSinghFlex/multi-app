"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, PlusCircle } from "lucide-react"
import type { TwilioConversation } from "@/lib/types"

interface ChatConversationListProps {
  conversations: Array<
    TwilioConversation & {
      displayName: string
      avatar?: string
      unread?: boolean
      timestamp?: string
    }
  >
  selectedConversationSid: string | null
  onSelectConversation: (sid: string) => void
  onNewConversation: () => void
}

export function ChatConversationList({
  conversations,
  selectedConversationSid,
  onSelectConversation,
  onNewConversation,
}: ChatConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conversation) =>
    conversation.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const unreadConversations = filteredConversations.filter((c) => c.unread)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-3 pb-2">
        <h3 className="text-sm font-medium">Conversations</h3>
        <Button variant="ghost" size="icon" onClick={onNewConversation}>
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative px-3 pb-2">
        <Search className="absolute left-5 top-2.5 h-4 w-4 text-[#858585]" />
        <Input
          type="search"
          placeholder="Search conversations..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0 flex-1 overflow-hidden">
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.sid}
                  className={`flex cursor-pointer items-center gap-3 border-b p-3 transition-colors hover:bg-[#f4f4f4] ${
                    selectedConversationSid === conversation.sid ? "bg-[#f4f4f4]" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation.sid)}
                >
                  <Avatar>
                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.displayName} />
                    <AvatarFallback>
                      {conversation.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{conversation.displayName}</h3>
                      <span className="text-xs text-[#858585]">{conversation.timestamp || ""}</span>
                    </div>
                    <p className="truncate text-xs text-[#858585]">{conversation.lastMessage || "No messages yet"}</p>
                  </div>
                  {conversation.unread && (
                    <div className="h-2 w-2 rounded-full bg-[#095d40]" aria-label="Unread message"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-[#858585]">No conversations found</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-0 flex-1 overflow-hidden">
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            {unreadConversations.length > 0 ? (
              unreadConversations.map((conversation) => (
                <div
                  key={conversation.sid}
                  className={`flex cursor-pointer items-center gap-3 border-b p-3 transition-colors hover:bg-[#f4f4f4] ${
                    selectedConversationSid === conversation.sid ? "bg-[#f4f4f4]" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation.sid)}
                >
                  <Avatar>
                    <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.displayName} />
                    <AvatarFallback>
                      {conversation.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{conversation.displayName}</h3>
                      <span className="text-xs text-[#858585]">{conversation.timestamp || ""}</span>
                    </div>
                    <p className="truncate text-xs text-[#858585]">{conversation.lastMessage || "No messages yet"}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-[#095d40]" aria-label="Unread message"></div>
                </div>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-[#858585]">No unread messages</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
