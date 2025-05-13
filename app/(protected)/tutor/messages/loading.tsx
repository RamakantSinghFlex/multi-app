"use client"

import { Loader2 } from "lucide-react"
import { MessageSkeleton } from "@/components/chat/message-skeleton"

export default function TutorMessagesLoading() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Messages</h1>
        <p className="text-[#858585]">Loading messaging interface...</p>
      </div>

      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Conversations List */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-1 lg:col-span-1">
          <div className="flex flex-row items-center justify-between p-4 border-b">
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="h-[calc(100vh-18rem)] overflow-y-auto">
            <div className="flex h-64 flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#095d40]" />
              <p className="mt-4 text-sm text-[#858585]">
                Loading conversations...
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-2 lg:col-span-3">
          <div className="border-b p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="ml-3">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex h-[calc(100vh-25rem)] flex-col justify-between p-0">
            <div className="flex-1 overflow-y-auto p-4">
              <MessageSkeleton count={3} incoming={true} />
              <MessageSkeleton count={2} incoming={false} />
            </div>
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
                <div className="h-10 flex-1 rounded-md bg-gray-200 animate-pulse"></div>
                <div className="h-8 w-8 rounded bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
