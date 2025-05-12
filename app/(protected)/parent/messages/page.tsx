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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Client } from "@twilio/conversations"
import { getTwilioToken } from "@/lib/api/messages"

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
  dateCreated: Date
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

export default function ParentMessagesPage() {
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
      console.log("Got Twilio token successfully") // Initialize the client with the token - using the exact pattern from the docs
      if (typeof window !== "undefined") {
        // Add configuration options to help with Sync errors
        const clientOptions = {
          logLevel: "info" as const, // Type assertion to make TypeScript happy
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
        })

        // Add more error handling for Sync specifically
        client.on("connectionStateChanged", (state: string) => {
          console.log("Twilio connection state changed:", state)
          if (state === "connecting") {
            // Connection is being established
            console.log("Attempting to establish connection...")
          } else if (state === "connected") {
            // Successfully connected
            console.log("Successfully connected to Twilio")
          } else if (state === "disconnected") {
            // Disconnected from the service
            console.log("Disconnected from Twilio service")
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
            // Attempt to recover with a fresh token
            setTimeout(() => {
              initializeTwilioClient()
            }, 2000)
          }
        }) // Add explicit error handlers for Sync errors
        client.on("error", (error) => {
          console.error("Twilio client encountered an error:", error)

          // Check if this is a sync error (most common for 403 forbidden errors)
          if (
            error.name === "SyncError" ||
            (error.message && error.message.includes("403"))
          ) {
            console.log(
              "Detected Twilio SyncError (403 forbidden). Attempting recovery..."
            )

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
  useEffect(() => {
    const initTwilio = async () => {
      try {
        setIsLoading(true)
        console.log("Starting Twilio initialization")

        // Initialize the Twilio client
        const client = await initializeTwilioClient()

        if (client) {
          console.log("Twilio client initialized successfully") // Set up event listeners with enhanced error handling
          client.on("connectionStateChanged", (state: string) => {
            console.log("Twilio connection state changed:", state)
            if (state === "connecting") {
              // Connection is being established
              console.log("Attempting to establish connection...")
            } else if (state === "connected") {
              // Successfully connected
              console.log("Successfully connected to Twilio")
            } else if (state === "disconnected") {
              // Disconnected from the service
              console.log("Disconnected from Twilio service")
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
              // Attempt to recover with a fresh token
              setTimeout(() => {
                initializeTwilioClient()
              }, 2000)
            }
          })

          client.on("conversationAdded", (conversation: any) => {
            console.log("Conversation added:", conversation.sid)
            loadConversations(client)
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

  // Load conversations
  const loadConversations = async (client: any) => {
    try {
      console.log("Loading conversations")
      const subscribedConversations = await client.getSubscribedConversations()

      const formattedConversations = subscribedConversations.items.map(
        (conv: any) => ({
          sid: conv.sid,
          friendlyName: conv.friendlyName || "Unnamed Conversation",
          dateUpdated: conv.dateUpdated,
          unreadMessagesCount: conv.unreadMessagesCount,
        })
      )

      // Sort by most recent
      formattedConversations.sort(
        (a: any, b: any) =>
          new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()
      )

      setConversations(formattedConversations)
      console.log(`Loaded ${formattedConversations.length} conversations`)

      // Select the first conversation if none is selected
      if (formattedConversations.length > 0 && !selectedConversation) {
        const firstConversation = await client.getConversationBySid(
          formattedConversations[0].sid
        )
        setSelectedConversation(firstConversation)
        loadMessages(firstConversation)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    }
  }
  // Handle conversation selection
  const handleSelectConversation = async (sid: string) => {
    if (selectedConversation?.sid === sid) return

    setIsLoadingMessages(true)
    setMessages([])

    try {
      // Unsubscribe from the previous conversation's events if one is selected
      if (selectedConversation) {
        try {
          selectedConversation.removeAllListeners()
        } catch (unsubError) {
          console.warn(
            "Error removing listeners from previous conversation:",
            unsubError
          )
        }
      }

      // Get the new conversation
      const conversation = await twilioClient.getConversationBySid(sid)
      setSelectedConversation(conversation)
      await loadMessages(conversation)
    } catch (error) {
      console.error("Error selecting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation",
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
        console.warn(
          "Error checking participants, attempting to join conversation:",
          err
        )
        return conversation.join().catch((joinErr: Error) => {
          console.error("Failed to join conversation:", joinErr)
        })
      })

      // Get messages after ensuring we're properly subscribed
      const messagesPaginator = await conversation.getMessages()

      const formattedMessages = messagesPaginator.items.map((message: any) => ({
        sid: message.sid,
        author: message.author,
        body: message.body,
        dateCreated: message.dateCreated,
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
      conversation.removeAllListeners("messageAdded") // Set up message listener
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
              dateCreated: message.dateCreated,
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

      // Return a cleanup function to remove the listener
      return () => {
        conversation.removeListener("messageAdded", messageListener)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      toast({
        title: "Error",
        description: "Could not load messages. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Send a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    try {
      await selectedConversation.sendMessage(messageText)
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedConversation) return

    const file = files[0]
    setIsUploading(true)

    try {
      // Create a form data object for the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("conversationSid", selectedConversation.sid)

      // Upload the file to your server first
      const uploadResponse = await fetch("/api/twilio/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      const { mediaUrl } = await uploadResponse.json()

      // Now send the message with the media
      await selectedConversation.sendMessage({
        contentType: file.type,
        media: mediaUrl,
        body: `Sent a file: ${file.name}`,
      })

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the file.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Open new conversation dialog
  const openNewConversationDialog = async () => {
    try {
      // Get related users from local storage
      const storedRelationships = localStorage.getItem("userRelationships")
      let relatedUsers: User[] = []

      if (storedRelationships) {
        const relationships = JSON.parse(storedRelationships)
        // Filter for tutors and students only for parent view
        relatedUsers = [
          ...(relationships.tutors || []),
          ...(relationships.students || []),
        ]
      } else {
        // Fallback mock data if no relationships found
        relatedUsers = [
          {
            id: "user1",
            firstName: "John",
            lastName: "Smith",
            email: "john@example.com",
            role: "Tutor",
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
            role: "Tutor",
          },
        ]
      }

      setAvailableUsers(relatedUsers)
      setIsNewConversationOpen(true)
    } catch (error) {
      console.error("Error loading contacts:", error)
      toast({
        title: "Error",
        description: "Failed to load available contacts",
        variant: "destructive",
      })
    }
  }

  // Create a new conversation - simplified to match the example
  const createNewConversation = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to chat with",
        variant: "destructive",
      })
      return
    }

    setIsCreatingConversation(true)

    try {
      // Find selected user
      const selectedUser = availableUsers.find((u) => u.id === selectedUserId)
      const name =
        conversationName ||
        `Chat with ${selectedUser?.firstName} ${selectedUser?.lastName}`

      console.log("Creating conversation with name:", name)

      // Create conversation using the exact pattern from the docs
      const conversation = await twilioClient.createConversation()
      console.log("Created conversation:", conversation.sid)

      // Set the friendly name
      await conversation.updateFriendlyName(name)
      console.log("Updated conversation name to:", name)

      // Add the current user as a participant
      await conversation.join()
      console.log("Joined the conversation")

      // Add the selected user as a participant using the add method
      await conversation.add(selectedUserId)
      console.log("Added participant:", selectedUserId)

      // Close dialog and reset form
      setIsNewConversationOpen(false)
      setSelectedUserId("")
      setConversationName("")

      // Select the new conversation
      setSelectedConversation(conversation)
      loadMessages(conversation)

      // Refresh conversation list
      loadConversations(twilioClient)

      toast({
        title: "Success",
        description: "Conversation created successfully",
      })
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      })
    } finally {
      setIsCreatingConversation(false)
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
        <p className="text-[#858585]">
          Communicate with tutors and your children
        </p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <h3 className="font-semibold">Conversations</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={openNewConversationDialog}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </CardHeader>
          <div className="h-[calc(100vh-18rem)] overflow-y-auto">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#095d40]" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.sid}
                    className={`flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-100 ${
                      selectedConversation?.sid === conversation.sid
                        ? "bg-gray-100"
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation.sid)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/placeholder.svg"
                        alt={conversation.friendlyName}
                      />
                      <AvatarFallback>
                        {conversation.friendlyName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium">{conversation.friendlyName}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-center text-gray-500">
                  No conversations yet.
                  <br />
                  Start a new chat!
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="md:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedConversation.friendlyName}
                    />
                    <AvatarFallback>
                      {selectedConversation.friendlyName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {selectedConversation.friendlyName}
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
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.sid}
                          className={`flex ${message.author === user?.id.toString() ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.author === user?.id.toString()
                                ? "bg-[#095d40] text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p>{message.body}</p>
                            {message.media && message.media.length > 0 && (
                              <div className="mt-2">
                                {message.media.map((media) => (
                                  <div key={media.sid} className="mt-1">
                                    {media.contentType.startsWith("image/") ? (
                                      <a
                                        href={media.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <img
                                          src={media.url || "/placeholder.svg"}
                                          alt={media.filename}
                                          className="max-h-40 rounded-md"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        href={media.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-500 hover:underline"
                                      >
                                        {media.filename} (
                                        {Math.round(media.size / 1024)} KB)
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="mt-1 text-right text-xs opacity-70">
                              {new Date(message.dateCreated).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-[#858585]">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t p-3">
                  <div className="flex items-center gap-2">
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
                      onClick={handleAttachmentClick}
                      disabled={!selectedConversation || isUploading}
                      className="h-9 w-9"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-[#095d40] hover:bg-[#02342e]"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h3 className="mb-2 text-sm font-medium">
                  Select a conversation
                </h3>
                <p className="text-[#858585]">
                  Choose a conversation from the list or start a new one
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* New Conversation Dialog */}
      <Dialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a user to chat with" />
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
            <div className="grid gap-2">
              <Label htmlFor="name">Conversation Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Enter a name for this conversation"
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewConversationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={createNewConversation}
              disabled={isCreatingConversation || !selectedUserId}
            >
              {isCreatingConversation ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
