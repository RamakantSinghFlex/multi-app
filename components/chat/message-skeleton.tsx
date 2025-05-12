import { cn } from "@/lib/utils"

interface MessageSkeletonProps {
  count?: number
  incoming?: boolean
}

export function MessageSkeleton({
  count = 3,
  incoming = true,
}: MessageSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex ${incoming ? "justify-start" : "justify-end"}`}
        >
          <div
            className={cn(
              "max-w-[70%] rounded-lg p-3 animate-pulse",
              incoming ? "bg-gray-200" : "bg-[#0c6a4a]"
            )}
            style={{ width: `${Math.max(20, Math.min(70, 30 + i * 15))}%` }}
          >
            <div className="h-4 w-full rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="mt-2 space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="h-4 w-1/2 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="mt-2 flex justify-end">
              <div className="h-3 w-16 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
