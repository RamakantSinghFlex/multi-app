import { cn } from "@/lib/utils"

interface ScheduleItemProps {
  time: string
  title: string
  subtitle?: string
  date?: string
  className?: string
}

export function ScheduleItem({ time, title, subtitle, date, className }: ScheduleItemProps) {
  return (
    <div className={cn("flex items-start gap-4 py-2", className)}>
      <div className="flex min-w-[60px] flex-col items-end">
        <span className="text-xs font-medium">{time}</span>
        {date && <span className="text-xs text-[#858585]">{date}</span>}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        {subtitle && <p className="text-xs text-[#858585]">{subtitle}</p>}
      </div>
    </div>
  )
}
