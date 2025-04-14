import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

interface TutorCardProps {
  name: string
  subject: string
  image: string
  status: "active" | "closed"
  completedSessions: number
  upcomingSessions: number
  className?: string
}

export function TutorCard({
  name,
  subject,
  image,
  status,
  completedSessions,
  upcomingSessions,
  className,
}: TutorCardProps) {
  return (
    <div className={cn("bg-white p-4", className)}>
      <div className="flex items-center gap-3">
        <Image src={image || "/placeholder.svg"} alt={name} width={40} height={40} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">{name}</h4>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                status === "active" ? "bg-[#e3fae3] text-[#095d40]" : "bg-[#f1f1f1] text-[#858585]",
              )}
            >
              {status === "active" ? "Active" : "Closed"}
            </span>
          </div>
          <p className="text-xs text-[#858585]">Subject: {subject}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#f1f1f1] pt-3 text-center">
        <div>
          <p className="text-xs text-[#858585]">Completed Session</p>
          <p className="text-sm font-medium">{completedSessions}</p>
        </div>
        <div>
          <p className="text-xs text-[#858585]">Upcoming Session</p>
          <p className="text-sm font-medium">{upcomingSessions}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1"
          >
            <rect x="1.5" y="2" width="9" height="8" rx="1" stroke="#858585" strokeWidth="1" />
            <path d="M3.5 1.5V2.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
            <path d="M8.5 1.5V2.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
            <path d="M1.5 4.5H10.5" stroke="#858585" strokeWidth="1" strokeLinecap="round" />
          </svg>
          Schedule
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          <MessageSquare className="mr-1 h-3 w-3" />
          Message
        </Button>
      </div>
    </div>
  )
}
