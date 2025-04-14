import { cn } from "@/lib/utils"

interface ProgressCircleProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  sublabel?: string
}

export function ProgressCircle({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  className,
  label,
  sublabel,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = value / max
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="progress-ring__background"
          stroke="#f1f1f1"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring__foreground"
          stroke="#095d40"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label && <span className="text-2xl font-bold">{label}</span>}
        {sublabel && <span className="text-xs text-[#858585]">{sublabel}</span>}
      </div>
    </div>
  )
}
