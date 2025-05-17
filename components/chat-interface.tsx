"use client"

import {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
  useEffect,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { FilePreview } from "@/components/file-preview"
import { useChat, type ChatMessage } from "@/hooks/use-chat"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ChatInterface() {
  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // In a real app, you would get the user identity from authentication
  const userIdentity = "current-user"

  const {
    messages,
    loading,
    error: chatError,
    sendMessage,
    sendFileMessage,
  } = useChat(userIdentity)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Set error from chat
  useEffect(() => {
    if (chatError) {
      setError(chatError)
    }
  }, [chatError])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) return

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit")
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!message.trim() && !file) return

    try {
      setIsSending(true)

      let success = false

      if (file) {
        success = await sendFileMessage(message, file)
      } else {
        success = await sendMessage(message)
      }

      if (success) {
        // Reset form
        setMessage("")
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        setError("Failed to send message. Please try again.")
      }
    } catch (err) {
      setError("Failed to send message. Please try again.")
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Helper to determine if a message is from the current user
  const isCurrentUser = (message: ChatMessage) => {
    return message.author === userIdentity
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-medium">Twilio-Style Chat</h2>
        <p className="text-sm text-gray-500">Powered by Next.js</p>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] mb-4 p-3 rounded-lg",
                isCurrentUser(msg)
                  ? "bg-blue-50 text-blue-800 ml-auto"
                  : msg.author === "system"
                    ? "bg-gray-50 text-gray-700 mx-auto text-center"
                    : "bg-gray-100 text-gray-800"
              )}
            >
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mb-2">
                  {msg.attachments.map((attachment, index) => (
                    <div key={index} className="mb-2">
                      {attachment.contentType.startsWith("image/") ? (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={attachment.url || "/placeholder.svg"}
                            alt={attachment.filename}
                            className="max-w-full rounded-md max-h-48 object-contain"
                          />
                        </a>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 bg-white rounded border text-blue-600 hover:text-blue-800"
                        >
                          <FilePreview
                            fileInfo={{
                              name: attachment.filename,
                              size: attachment.size,
                              type: attachment.contentType,
                            }}
                          />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {msg.body && <p>{msg.body}</p>}
              <div className="text-xs text-gray-500 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50">{error}</div>
      )}

      {/* File preview */}
      {file && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <FilePreview file={file} onRemove={removeFile} />
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex items-end gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
        </Button>

        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="border-gray-200 focus-visible:ring-blue-500"
            disabled={isSending}
          />
        </div>

        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600"
          disabled={(!message.trim() && !file) || isSending}
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  )
}
