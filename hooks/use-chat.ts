"use client"

import { useState, useCallback } from "react"

export type FileAttachment = {
  filename: string
  size: number
  contentType: string
  url: string
}

export type ChatMessage = {
  id: string
  body?: string
  author: string
  timestamp: Date
  attachments?: FileAttachment[]
}

export function useChat(identity: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      body: "Welcome to the chat! This is a simplified version without the Twilio SDK.",
      author: "system",
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conversationId = "mock-conversation-123"

  const sendMessage = useCallback(
    async (body: string) => {
      try {
        setLoading(true)

        const newMessage: ChatMessage = {
          id: `local-${Date.now()}`,
          body,
          author: identity,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, newMessage])

        setTimeout(() => {
          const responseMessage: ChatMessage = {
            id: `response-${Date.now()}`,
            body: `Thanks for your message: "${body}"`,
            author: "assistant",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, responseMessage])
        }, 1000)

        return true
      } catch (err) {
        console.error("Error sending message:", err)
        setError(err instanceof Error ? err.message : "Failed to send message")
        return false
      } finally {
        setLoading(false)
      }
    },
    [identity]
  )

  const sendFileMessage = useCallback(
    async (body: string, file: File) => {
      try {
        setLoading(true)

        const fileUrl = URL.createObjectURL(file)

        const newMessage: ChatMessage = {
          id: `local-file-${Date.now()}`,
          body,
          author: identity,
          timestamp: new Date(),
          attachments: [
            {
              filename: file.name,
              size: file.size,
              contentType: file.type,
              url: fileUrl,
            },
          ],
        }

        setMessages((prev) => [...prev, newMessage])

        setTimeout(() => {
          const responseMessage: ChatMessage = {
            id: `response-${Date.now()}`,
            body: `I received your file: ${file.name}`,
            author: "assistant",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, responseMessage])
        }, 1500)

        return true
      } catch (err) {
        console.error("Error sending file message:", err)
        setError(
          err instanceof Error ? err.message : "Failed to send file message"
        )
        return false
      } finally {
        setLoading(false)
      }
    },
    [identity]
  )

  return {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    sendFileMessage,
  }
}
