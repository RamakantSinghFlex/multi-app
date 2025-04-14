import type React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function MetricCard({ value, label, icon, onClick, className }: MetricCardProps) {
  return (
    <div className={cn("bg-[#f4f4f4] p-4", className)}>
      <div className="flex items-center gap-2">
        {icon && <div className="flex h-5 w-5 items-center justify-center text-[#858585]">{icon}</div>}
        <div className="flex flex-col">
          <span className="text-lg font-bold">{value}</span>
          <span className="text-xs text-[#858585]">{label}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[#095d40]">View Details</span>
        <ChevronRight className="h-3 w-3 text-[#095d40]" />
      </div>
    </div>
  )
}
