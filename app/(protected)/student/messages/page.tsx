"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Send, PlusCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function StudentMessagesPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")

  // Mock data for demonstration
  const conversations = [
    {
      id: 1,
      name: "John Smith",
      role: "Tutor",
      avatar: "/placeholder.svg?height=40&width=40&text=JS",
      lastMessage: "When would you like to schedule our next session?",
      timestamp: "10:30 AM",
      unread: true,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Tutor",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      lastMessage: "I've shared some practice problems for you to work on.",
      timestamp: "Yesterday",
      unread: false,
    },
    {
      id: 3,
      name: "Michael Brown",
      role: "Tutor",
      avatar: "/placeholder.svg?height=40&width=40&text=MB",
      lastMessage: "Great progress today! Keep up the good work.",
      timestamp: "Monday",
      unread: false,
    },
  ]

  const messages = [
    {
      id: 1,
      conversationId: 1,
      sender: "John Smith",
      content: "Hi there! How are you doing with the homework I assigned?",
      timestamp: "10:15 AM",
      isSelf: false,
    },
    {
      id: 2,
      conversationId: 1,
      sender: "You",
      content: "I've completed most of it, but I'm stuck on problem #5.",
      timestamp: "10:20 AM",
      isSelf: true,
    },
    {
      id: 3,
      conversationId: 1,
      sender: "John Smith",
      content: "No problem, we can go over it in our next session. When would you like to schedule our next session?",
      timestamp: "10:30 AM",
      isSelf: false,
    },
  ]

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const conversationMessages = messages.filter((message) => message.conversationId === selectedConversation)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // In a real app, you would send the message to the API
    console.log("Sending message:", newMessage)
    setNewMessage("")
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Messages</h1>
        <p className="text-[#858585]">Communicate with your tutors</p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <Button variant="ghost" size="icon">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#858585]" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-0">
                <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex cursor-pointer items-center gap-3 border-b p-3 transition-colors hover:bg-[#f4f4f4] ${
                          selectedConversation === conversation.id ? "bg-[#f4f4f4]" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <Avatar>
                          <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                          <AvatarFallback>
                            {conversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">{conversation.name}</h3>
                            <span className="text-xs text-[#858585]">{conversation.timestamp}</span>
                          </div>
                          <p className="truncate text-xs text-[#858585]">{conversation.lastMessage}</p>
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
              <TabsContent value="unread" className="mt-0">
                <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
                  {filteredConversations.filter((c) => c.unread).length > 0 ? (
                    filteredConversations
                      .filter((c) => c.unread)
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`flex cursor-pointer items-center gap-3 border-b p-3 transition-colors hover:bg-[#f4f4f4] ${
                            selectedConversation === conversation.id ? "bg-[#f4f4f4]" : ""
                          }`}
                          onClick={() => setSelectedConversation(conversation.id)}
                        >
                          <Avatar>
                            <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                            <AvatarFallback>
                              {conversation.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">{conversation.name}</h3>
                              <span className="text-xs text-[#858585]">{conversation.timestamp}</span>
                            </div>
                            <p className="truncate text-xs text-[#858585]">{conversation.lastMessage}</p>
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
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={conversations.find((c) => c.id === selectedConversation)?.avatar || "/placeholder.svg"}
                      alt={conversations.find((c) => c.id === selectedConversation)?.name || ""}
                    />
                    <AvatarFallback>
                      {(conversations.find((c) => c.id === selectedConversation)?.name || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {conversations.find((c) => c.id === selectedConversation)?.name}
                    </CardTitle>
                    <p className="text-xs text-[#858585]">
                      {conversations.find((c) => c.id === selectedConversation)?.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex h-[calc(100vh-25rem)] flex-col justify-between p-0">
                <div className="flex-1 overflow-y-auto p-4">
                  {conversationMessages.map((message) => (
                    <div key={message.id} className={`mb-4 flex ${message.isSelf ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.isSelf ? "bg-[#095d40] text-white" : "bg-[#f4f4f4] text-[#000000]"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`mt-1 text-right text-xs ${message.isSelf ? "text-white/70" : "text-[#858585]"}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button size="icon" onClick={handleSendMessage} className="bg-[#095d40] hover:bg-[#02342e]">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h3 className="mb-2 text-sm font-medium">Select a conversation</h3>
                <p className="text-[#858585]">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
