"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CalendarViewType } from "./google-calendar-view"

interface CalendarHeaderProps {
  viewTitle: string
  viewType: CalendarViewType
  onViewChange: (view: CalendarViewType) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({
  viewTitle,
  viewType,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{viewTitle}</h2>
      </div>

      <div className="flex space-x-1">
        <Button variant={viewType === "day" ? "default" : "outline"} size="sm" onClick={() => onViewChange("day")}>
          Day
        </Button>
        <Button variant={viewType === "week" ? "default" : "outline"} size="sm" onClick={() => onViewChange("week")}>
          Week
        </Button>
        <Button variant={viewType === "month" ? "default" : "outline"} size="sm" onClick={() => onViewChange("month")}>
          Month
        </Button>
      </div>
    </div>
  )
}
