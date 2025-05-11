"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { ChatConversationList } from "@/components/chat/chat-conversation-list"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog"
import { getTwilioToken, getTwilioConversations } from "@/lib/api/twilio"
import type { TwilioMessage, TwilioConversation } from "@/lib/types"
import { Client as TwilioClient } from "twilio-chat"

export default function StudentMessagesPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<
    Array<
      TwilioConversation & {
        displayName: string
        avatar?: string
        unread?: boolean
        timestamp?: string
      }
    >
  >([])
  const [selectedConversationSid, setSelectedConversationSid] = useState<string | null>(null)
  const [messages, setMessages] = useState<TwilioMessage[]>([])
  const [twilioClient, setTwilioClient] = useState<any>(null)
  const [currentConversation, setCurrentConversation] = useState<any>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize Twilio client
  useEffect(() => {
    const initTwilio = async () => {
      try {
        setIsLoading(true)

        // Get Twilio token
        const tokenResponse = await getTwilioToken()
        if (tokenResponse.error || !tokenResponse.data?.token) {
          toast({
            title: "Error",
            description: tokenResponse.error || "Failed to get Twilio token",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Initialize Twilio Chat client
        const client = await TwilioClient.create(tokenResponse.data.token)
        setTwilioClient(client)

        // Get user's conversations
        await loadConversations()

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing Twilio:", error)
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again later.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    if (user) {
      initTwilio()
    }

    return () => {
      // Clean up Twilio client on unmount
      if (twilioClient) {
        twilioClient.shutdown()
      }
    }
  }, [user])

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await getTwilioConversations()

      if (response.error || !response.data?.conversations) {
        toast({
          title: "Error",
          description: response.error || "Failed to load conversations",
          variant: "destructive",
        })
        return
      }

      // Format conversations for display
      const formattedConversations = response.data.conversations.map((conv) => ({
        ...conv,
        displayName: conv.friendlyName || "Unnamed Conversation",
        timestamp: "Recently",
        unread: false, // In a real app, you would determine this from the API
      }))

      setConversations(formattedConversations)

      // Select the first conversation if none is selected
      if (formattedConversations.length > 0 && !selectedConversationSid) {
        handleSelectConversation(formattedConversations[0].sid)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    }
  }

  // Handle conversation selection
  const handleSelectConversation = async (sid: string) => {
    if (sid === selectedConversationSid) return

    setSelectedConversationSid(sid)
    setMessages([])
    setIsLoadingMessages(true)

    try {
      // Get the conversation object from Twilio
      if (twilioClient) {
        const conversation = await twilioClient.getConversationBySid(sid)
        setCurrentConversation(conversation)

        // Load messages
        const twilioMessages = await conversation.getMessages()
        setMessages(
          twilioMessages.items.map((item: any) => ({
            sid: item.sid,
            author: item.author,
            body: item.body,
            dateCreated: item.dateCreated.toISOString(),
            media: item.media?.map((m: any) => ({
              sid: m.sid,
              contentType: m.contentType,
              filename: m.filename,
              size: m.size,
              url: m.url,
            })),
          })),
        )

        // Subscribe to new messages
        conversation.on("messageAdded", (message: any) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sid: message.sid,
              author: message.author,
              body: message.body,
              dateCreated: message.dateCreated.toISOString(),
              media: message.media?.map((m: any) => ({
                sid: m.sid,
                contentType: m.contentType,
                filename: m.filename,
                size: m.size,
                url: m.url,
              })),
            },
          ])
          scrollToBottom()
        })
      }
    } catch (error) {
      console.error("Error selecting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation messages",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Send a message
  const handleSendMessage = async (content: string, mediaSid?: string) => {
    if (!currentConversation) return

    try {
      const messageOptions: any = {}

      if (content.trim()) {
        messageOptions.body = content
      }

      if (mediaSid) {
        messageOptions.mediaSid = mediaSid
      }

      await currentConversation.sendMessage(messageOptions)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  // Handle new conversation creation
  const handleConversationCreated = (conversationSid: string) => {
    loadConversations()
    handleSelectConversation(conversationSid)
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Messages</h1>
        <p className="text-[#858585]">Communicate with your tutors</p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#095d40]" />
              </div>
            ) : (
              <ChatConversationList
                conversations={conversations}
                selectedConversationSid={selectedConversationSid}
                onSelectConversation={handleSelectConversation}
                onNewConversation={() => setIsNewConversationOpen(true)}
              />
            )}
          </CardHeader>
        </Card>

        <Card className="md:col-span-2">
          {selectedConversationSid ? (
            <>
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={conversations.find((c) => c.sid === selectedConversationSid)?.avatar || "/placeholder.svg"}
                      alt={conversations.find((c) => c.sid === selectedConversationSid)?.displayName || ""}
                    />
                    <AvatarFallback>
                      {(conversations.find((c) => c.sid === selectedConversationSid)?.displayName || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {conversations.find((c) => c.sid === selectedConversationSid)?.displayName}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex h-[calc(100vh-25rem)] flex-col justify-between p-0">
                <div className="flex-1 overflow-y-auto p-4">
                  {isLoadingMessages ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#095d40]" />
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <ChatMessage
                        key={message.sid}
                        message={message}
                        isCurrentUser={message.author === user?.id.toString()}
                        userName={
                          message.author === user?.id.toString()
                            ? `${user.firstName} ${user.lastName}`
                            : conversations.find((c) => c.sid === selectedConversationSid)?.displayName
                        }
                        userAvatar={
                          message.author === user?.id.toString()
                            ? "/placeholder.svg"
                            : conversations.find((c) => c.sid === selectedConversationSid)?.avatar
                        }
                      />
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-[#858585]">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <ChatInput
                  onSendMessage={handleSendMessage}
                  conversationSid={selectedConversationSid}
                  disabled={!currentConversation}
                />
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

      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
