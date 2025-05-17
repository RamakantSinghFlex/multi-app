"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, PlusCircle, Send, Paperclip } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Client } from "@twilio/conversations"
// Custom typing to handle Twilio client events
type TwilioClientEvents = "connectionStateChanged" | "conversationAdded" | "conversationRemoved" | "connectionError"
import { getTwilioToken } from "@/lib/api/messages"
import { MessageSkeleton } from "@/components/chat/message-skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatMessage } from "@/components/chat/chat-message"

// Minimal type definitions
interface Conversation {
  sid: string
  friendlyName: string
  lastMessage?: string
  dateUpdated?: Date
  unreadMessagesCount?: number
}

interface Message {
  sid: string
  author: string
  body: string
  dateCreated: string
  media?: Array<{
    sid: string
    filename: string
    contentType: string
    size: number
    url: string
  }>
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

export default function TutorMessagesPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [twilioClient, setTwilioClient] = useState<any>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [conversationName, setConversationName] = useState("")
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  // Helper function to create a small delay for smoother loading UX
  // This delay function is used in the initTwilio function below

  // Initialize Twilio client
  const initializeTwilioClient = async () => {
    try {
      setIsLoading(true)

      // Shutdown existing client if it exists
      if (twilioClient) {
        try {
          console.log("Shutting down existing Twilio client")
          await twilioClient.shutdown()
        } catch (shutdownError) {
          console.warn("Error shutting down Twilio client:", shutdownError)
        }
      }

      // Get a fresh token using our helper function
      const token = await getTwilioToken()
      console.log("Got Twilio token successfully")

      // Initialize the client with the token
      if (typeof window !== "undefined") {
        // Add configuration options to help with Sync errors
        const clientOptions = {
          logLevel: "info" as const,
          connectionRetryOptions: {
            maxAttempts: 5,
            initialDelay: 1000,
            maxDelay: 8000,
          },
        }

        // Create client with options
        const client = new Client(token, clientOptions)

        // Set up global error handlers
        client.on("tokenAboutToExpire", async () => {
          console.log("Token about to expire, refreshing...")
          try {
            const newToken = await getTwilioToken()
            client.updateToken(newToken)
          } catch (err) {
            console.error("Error refreshing token:", err)
          }
        })

        client.on("tokenExpired", async () => {
          console.log("Token expired, refreshing...")
          try {
            const newToken = await getTwilioToken()
            client.updateToken(newToken)
          } catch (err) {
            console.error("Error refreshing token:", err)
            // If token refresh fails, we may need to reinitialize the client
            initializeTwilioClient()
          }
        }) // Add explicit error handler for client errors
        // @ts-ignore - Twilio's type definitions are not always complete
        client.on("connectionError", (error: any) => {
          console.error("Twilio client encountered an error:", error)

          // Check if this is a sync error (most common for 403 forbidden errors)
          if (error.name === "SyncError" || (error.message && error.message.includes("403"))) {
            console.log("Detected Twilio SyncError (403 forbidden). Attempting recovery...")

            // Show user friendly message
            toast({
              title: "Connection Issue",
              description: "Reconnecting to chat service...",
              variant: "default",
            })

            // Try to recover by reinitializing
            setTimeout(() => {
              initializeTwilioClient()
            }, 3000)
          }
        })

        console.log("Created Twilio client instance")
        setTwilioClient(client)
        setIsLoading(false)
        return client
      }
      return null
    } catch (error) {
      console.error("Failed to initialize Twilio client:", error)
      setIsLoading(false)
      setError("Failed to initialize chat. Please try again later.")
      return null
    }
  }

  // Load conversations
  const loadConversations = async (client: any) => {
    try {
      console.log("Loading conversations")
      const subscribedConversations = await client.getSubscribedConversations()

      const formattedConversations = subscribedConversations.items.map((conv: any) => ({
        sid: conv.sid,
        friendlyName: conv.friendlyName || "Unnamed Conversation",
        dateUpdated: conv.dateUpdated,
        unreadMessagesCount: conv.unreadMessagesCount,
      }))

      // Sort conversations by date updated, newest first
      formattedConversations.sort((a: Conversation, b: Conversation) => {
        return new Date(b.dateUpdated as Date).getTime() - new Date(a.dateUpdated as Date).getTime()
      })

      setConversations(formattedConversations)
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const initTwilio = async () => {
      // Helper function to create a small delay for smoother loading UX
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

      try {
        setIsLoading(true)
        // Add a small delay for smoother loading transitions
        await delay(500)
        console.log("Starting Twilio initialization")

        // Initialize the Twilio client
        const client = await initializeTwilioClient()

        if (client) {
          console.log("Twilio client initialized successfully") // Set up event listeners with enhanced error handling
          client.on("connectionStateChanged" as TwilioClientEvents, (state: string) => {
            console.log("Twilio connection state changed:", state)
            if (state === "connecting") {
              // Connection is being established
              console.log("Attempting to establish connection...")
              toast({
                title: "Connecting",
                description: "Establishing connection to messaging service...",
              })
            } else if (state === "connected") {
              // Successfully connected
              console.log("Successfully connected to Twilio")
              toast({
                title: "Connected",
                description: "Successfully connected to messaging service",
              })
            } else if (state === "disconnected") {
              // Disconnected from the service
              console.log("Disconnected from Twilio service")
              toast({
                title: "Disconnected",
                description: "Disconnected from messaging service. Reconnecting...",
              })
            } else if (state === "denied") {
              // Connection was denied
              console.error("Connection to Twilio was denied")
              toast({
                title: "Connection Error",
                description: "Chat connection was denied. Please try again.",
                variant: "destructive",
              })
            } else if (state === "error") {
              // Connection encountered an error
              console.error("Twilio connection error occurred")
              toast({
                title: "Connection Error",
                description: "Messaging service connection error. Reconnecting...",
                variant: "destructive",
              })
              // Attempt to recover with a fresh token
              setTimeout(() => {
                initializeTwilioClient()
              }, 2000)
            }
          })

          client.on("conversationAdded" as TwilioClientEvents, (conversation: any) => {
            console.log("Conversation added:", conversation.sid)
            loadConversations(client)
          }) // Add conversationRemoved event handler
          client.on("conversationRemoved" as TwilioClientEvents, (conversation: any) => {
            console.log("Conversation removed:", conversation.sid)
            loadConversations(client)

            // If the removed conversation is the currently selected one, clear it
            if (selectedConversation?.sid === conversation.sid) {
              setSelectedConversation(null)
              setMessages([])
            }
          })

          // Load conversations
          await loadConversations(client)
        }

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

    if (user && typeof window !== "undefined") {
      console.log("User authenticated, initializing Twilio")
      initTwilio()
    }

    return () => {
      // Clean up Twilio client on unmount
      if (twilioClient) {
        console.log("Shutting down Twilio client")
        twilioClient.shutdown()
      }
    }
    // We're intentionally not including initializeTwilioClient, loadConversations, and twilioClient
    // in the dependency array to avoid re-initializing when these functions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Handle selecting a conversation
  const handleSelectConversation = async (conversationSid: string) => {
    try {
      setIsLoadingMessages(true)
      const conversation = await twilioClient.getConversationBySid(conversationSid)
      setSelectedConversation(conversation)

      // Load messages for the selected conversation
      await loadMessages(conversation)
    } catch (error) {
      console.error("Error selecting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Load messages for a conversation
  const loadMessages = async (conversation: any) => {
    try {
      // First, make sure we're properly subscribed to the conversation
      await conversation.getParticipants().catch((err: Error) => {
        console.warn("Error checking participants, attempting to join conversation:", err)
        return conversation.join().catch((joinErr: Error) => {
          console.error("Failed to join conversation:", joinErr)
        })
      }) // Get messages after ensuring we're properly subscribed
      const messagesPaginator = await conversation.getMessages()

      const formattedMessages = messagesPaginator.items.map((message: any) => ({
        sid: message.sid,
        author: message.author,
        body: message.body,
        dateCreated: message.dateCreated instanceof Date ? message.dateCreated.toISOString() : message.dateCreated,
        media: message.media?.map((m: any) => ({
          sid: m.sid,
          filename: m.filename,
          contentType: m.contentType,
          size: m.size,
          url: m.url,
        })),
      }))

      setMessages(formattedMessages)

      // Clean up any existing listeners before setting up a new one
      conversation.removeAllListeners("messageAdded")

      // Set up message listener
      const messageListener = (message: any) => {
        setMessages((prevMessages) => {
          // Check if message with this sid already exists to avoid duplicates
          const messageExists = prevMessages.some((m) => m.sid === message.sid)
          if (messageExists) {
            return prevMessages
          }

          return [
            ...prevMessages,
            {
              sid: message.sid,
              author: message.author,
              body: message.body,
              dateCreated:
                message.dateCreated instanceof Date ? message.dateCreated.toISOString() : message.dateCreated,
              media: message.media?.map((m: any) => ({
                sid: m.sid,
                filename: m.filename,
                contentType: m.contentType,
                size: m.size,
                url: m.url,
              })),
            },
          ]
        })
        scrollToBottom()
      }

      conversation.on("messageAdded", messageListener)
      scrollToBottom()
    } catch (error) {
      console.error("Error loading messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Send a message
  const sendMessage = async () => {
    if (!selectedConversation || !messageText.trim()) {
      return
    }

    try {
      await selectedConversation.sendMessage(messageText.trim())
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Open the new conversation dialog
  const openNewConversationDialog = async () => {
    try {
      // Try to load available contacts
      // In a real application, this would come from your backend API
      let relatedUsers: User[] = []

      // Try to get relationships from localStorage (for demo/testing purposes)
      const storedRelationships = localStorage.getItem("userRelationships")

      if (storedRelationships) {
        const relationships = JSON.parse(storedRelationships)
        // Filter for students and parents only for tutor view
        relatedUsers = [...(relationships.parents || []), ...(relationships.students || [])]
      } else {
        // Fallback mock data if no relationships found
        relatedUsers = [
          {
            id: "user1",
            firstName: "John",
            lastName: "Smith",
            email: "john@example.com",
            role: "Parent",
          },
          {
            id: "user2",
            firstName: "Sarah",
            lastName: "Johnson",
            email: "sarah@example.com",
            role: "Student",
          },
          {
            id: "user3",
            firstName: "Michael",
            lastName: "Brown",
            email: "michael@example.com",
            role: "Student",
          },
        ]
      }

      setAvailableUsers(relatedUsers)
      setIsNewConversationOpen(true)
    } catch (error) {
      console.error("Error loading contacts:", error)
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Create a new conversation
  const createNewConversation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !conversationName.trim()) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a conversation name.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreatingConversation(true)

      // Create a new conversation
      const newConversation = await twilioClient.createConversation({
        friendlyName: conversationName.trim(),
      })

      // Add the selected user as a participant
      await newConversation.add(selectedUserId)

      // Add the current user as a participant if they're not already
      await newConversation.join()

      // Reset form
      setSelectedUserId("")
      setConversationName("")
      setIsNewConversationOpen(false)

      // Reload conversations and select the new one
      await loadConversations(twilioClient)
      await handleSelectConversation(newConversation.sid)

      toast({
        title: "Success",
        description: "New conversation created successfully.",
      })
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  } // Handle file selection with improved feedback
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedConversation) return

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

    try {
      setIsUploading(true)

      console.log("Uploading file:", file.name, file.type, file.size)
      toast({
        title: "Uploading",
        description: `Uploading ${file.name} (${fileSize}KB)...`,
      })

      // Use appropriate method based on Twilio's API
      try {
        // First try the newer API method
        const mediaMessage = await selectedConversation.prepareMessage().addMedia(file).build()

        await mediaMessage.send()
      } catch (err) {
        console.log("Falling back to legacy media upload method", err)
        // Fall back to direct message with media
        await selectedConversation.sendMessage({
          contentType: file.type,
          media: file,
        })
      }

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
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
        <p className="text-[#858585]">Communicate with students and parents</p>
      </div>{" "}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}{" "}
      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Conversations List */}
        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <h3 className="font-semibold">Conversations</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={openNewConversationDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start new conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <div className="h-[calc(100vh-18rem)] overflow-y-auto">
            {" "}
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#095d40]" />
                <p className="mt-4 text-sm text-[#858585]">Loading conversations...</p>
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.sid}
                    className={`flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-100 ${
                      selectedConversation?.sid === conversation.sid ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation.sid)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={conversation.friendlyName} />
                      <AvatarFallback>
                        {conversation.friendlyName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <p className="truncate font-medium">{conversation.friendlyName}</p>
                      <p className="truncate text-xs text-[#858585]">{conversation.lastMessage || "No messages yet"}</p>
                    </div>{" "}
                    {conversation.unreadMessagesCount && conversation.unreadMessagesCount > 0 && (
                      <div className="ml-2 rounded-full bg-[#095d40] px-2 py-0.5 text-xs text-white">
                        {conversation.unreadMessagesCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-center text-[#858585]">No conversations yet</p>
              </div>
            )}
          </div>
        </Card>{" "}
        {/* Chat Area */}
        <Card className="md:col-span-2 lg:col-span-3">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b p-4">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt={selectedConversation.friendlyName} />
                    <AvatarFallback>
                      {selectedConversation.friendlyName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-medium">{selectedConversation.friendlyName}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex h-[calc(100vh-25rem)] flex-col justify-between p-0">
                <div className="flex-1 overflow-y-auto p-4">
                  {" "}
                  {isLoadingMessages ? (
                    <div className="p-4">
                      <MessageSkeleton count={4} incoming={true} />
                      <MessageSkeleton count={3} incoming={false} />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.sid}
                          message={message}
                          isCurrentUser={message.author === user?.id.toString()}
                          userName={
                            message.author === user?.id.toString()
                              ? `${user?.firstName || ""} ${user?.lastName || ""}`
                              : selectedConversation?.friendlyName || "Contact"
                          }
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-[#858585]">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
                <div className="border-t p-3">
                  {" "}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,video/mp4,audio/*"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleAttachmentClick}
                            disabled={!selectedConversation || isUploading}
                            className={`relative h-9 w-9 transition-all ${isUploading ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                                </span>
                              </>
                            ) : (
                              <Paperclip className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{isUploading ? "Uploading..." : "Attach file"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Button
                      type="button"
                      onClick={sendMessage}
                      disabled={!selectedConversation || !messageText.trim()}
                      className="bg-[#095d40]"
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md space-y-4 text-center">
                <h3 className="text-lg font-medium">Select a conversation to start messaging</h3>
                <p className="text-[#858585]">Choose an existing conversation from the list or start a new one</p>
                <Button onClick={openNewConversationDialog} className="bg-[#095d40]">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Conversation
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      {/* New Conversation Dialog */}
      <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <form onSubmit={createNewConversation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Conversation Name</Label>
              <Input
                id="name"
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
                placeholder="Tutoring Session - Math"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isCreatingConversation || !selectedUserId || !conversationName.trim()}
                className="bg-[#095d40]"
              >
                {isCreatingConversation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
