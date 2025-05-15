"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Client,
  type Conversation,
  type Message,
  type Participant,
} from "@twilio/conversations"

export type FileAttachment = {
  filename: string
  size: number
  contentType: string
  media: {
    url: string
  }
}

export type TwilioMessage = {
  id: string
  body?: string
  author: string
  dateCreated: Date
  attachedMedia?: FileAttachment[]
}

export function useTwilioConversations(
  identity: string,
  conversationSid?: string
) {
  const [client, setClient] = useState<Client | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<TwilioMessage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeClient() {
      try {
        setLoading(true)

        const response = await fetch(
          `/api/twilio-token?identity=${encodeURIComponent(identity)}`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to get token")
        }

        const twilioClient = new Client(data.token)

        twilioClient.on("connectionStateChanged", (state) => {
          console.log("Connection state changed to:", state)
        })

        twilioClient.on("tokenAboutToExpire", async () => {
          const response = await fetch(
            `/api/twilio-token?identity=${encodeURIComponent(identity)}`
          )
          const data = await response.json()
          twilioClient.updateToken(data.token)
        })

        await twilioClient.initialize()
        setClient(twilioClient)
      } catch (err) {
        console.error("Error initializing Twilio client:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize Twilio client"
        )
      } finally {
        setLoading(false)
      }
    }

    if (identity) {
      initializeClient()
    }

    return () => {
      if (client) {
        client.shutdown()
      }
    }
  }, [identity])

  useEffect(() => {
    async function setupConversation() {
      if (!client) return

      try {
        let conv: Conversation

        if (conversationSid) {
          conv = await client.getConversationBySid(conversationSid)
        } else {
          const uniqueName = `chat-${Date.now()}`
          conv = await client.createConversation({ uniqueName })
          await conv.join()
        }

        setConversation(conv)

        const messagesPaginator = await conv.getMessages()
        const twilioMessages = messagesPaginator.items.map(mapTwilioMessage)
        setMessages(twilioMessages)

        const participantsPaginator = await conv.getParticipants()
        setParticipants(participantsPaginator.items)

        conv.on("messageAdded", (message) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            mapTwilioMessage(message),
          ])
        })

        conv.on("participantJoined", (participant) => {
          setParticipants((prevParticipants) => [
            ...prevParticipants,
            participant,
          ])
        })

        conv.on("participantLeft", (participant) => {
          setParticipants((prevParticipants) =>
            prevParticipants.filter((p) => p.sid !== participant.sid)
          )
        })
      } catch (err) {
        console.error("Error setting up conversation:", err)
        setError(
          err instanceof Error ? err.message : "Failed to set up conversation"
        )
      }
    }

    if (client) {
      setupConversation()
    }
  }, [client, conversationSid])

  const mapTwilioMessage = useCallback((message: Message): TwilioMessage => {
    return {
      id: message.sid,
      body: message.body,
      author: message.author,
      dateCreated: message.dateCreated,
      attachedMedia: message.attachedMedia?.map((media) => ({
        filename: media.filename,
        size: media.size,
        contentType: media.contentType,
        media: {
          url: media.getContentTemporaryUrl(),
        },
      })),
    }
  }, [])

  const sendMessage = useCallback(
    async (body: string) => {
      if (!conversation) return

      try {
        await conversation.sendMessage(body)
      } catch (err) {
        console.error("Error sending message:", err)
        setError(err instanceof Error ? err.message : "Failed to send message")
      }
    },
    [conversation]
  )
  const sendFileMessage = useCallback(
    async (body: string, file: File) => {
      if (!conversation) return

      try {
        // Try direct media upload first using the Twilio SDK
        try {
          let messageBuilder = conversation.prepareMessage()

          // Add text if provided
          if (body?.trim()) {
            messageBuilder = messageBuilder.setBody(body.trim())
          }

          // Add media
          messageBuilder = messageBuilder.addMedia(file)

          // Build and send
          const mediaMessage = await messageBuilder.build()
          await mediaMessage.send()
          return true
        } catch (directError) {
          console.log(
            "Direct media upload failed, falling back to API:",
            directError
          )

          // Fallback to our API endpoint
          const formData = new FormData()
          formData.append("file", file)
          formData.append("conversationSid", conversation.sid)
          formData.append("body", body || `Sent a file: ${file.name}`)
          formData.append("identity", identity)

          // Get auth token from localStorage if available in browser env
          let token = ""
          if (typeof window !== "undefined") {
            token =
              localStorage.getItem("milestone-token") ||
              localStorage.getItem("auth_token") ||
              ""
          }

          const uploadResponse = await fetch("/api/messages/send", {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error(
              `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
            )
          }

          return true
        }
      } catch (err) {
        console.error("Error sending file message:", err)
        setError(
          err instanceof Error ? err.message : "Failed to send file message"
        )
        return false
      }
    },
    [conversation, identity]
  )

  return {
    client,
    conversation,
    messages,
    participants,
    loading,
    error,
    sendMessage,
    sendFileMessage,
  }
}
