import { cn } from "@/lib/utils"

interface TestCardProps {
  date: {
    day: number
    month: string
  }
  title: string
  subtitle: string
  time: string
  className?: string
}

export function TestCard({ date, title, subtitle, time, className }: TestCardProps) {
  return (
    <div className={cn("flex items-start space-x-4 py-2", className)}>
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-[#f4f4f4] text-center">
        <span className="text-xs uppercase text-[#858585]">{date.month}</span>
        <span className="text-lg font-bold">{date.day}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="text-xs text-[#858585]">{subtitle}</p>
      </div>
      <div className="text-xs text-[#858585]">{time}</div>
    </div>
  )
}
