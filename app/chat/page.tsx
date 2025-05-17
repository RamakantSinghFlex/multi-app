import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl">
        <ChatInterface />
      </div>
    </div>
  )
}
