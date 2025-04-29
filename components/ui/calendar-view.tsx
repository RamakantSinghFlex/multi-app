"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { isBefore, isSameDay, isPast, isToday } from "date-fns"

interface CalendarViewProps {
  initialMonth?: Date
  onDateSelect?: (date: Date) => void
  highlightedDates?: Date[]
  className?: string
  disablePastDates?: boolean
}

export function CalendarView({
  initialMonth = new Date(),
  onDateSelect,
  highlightedDates = [],
  className,
  disablePastDates = false,
}: CalendarViewProps) {
  // Initialize with current date if initial month is current month
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    isSameDay(initialMonth, today) ? today : null
  )

  // Use useEffect with empty dependency array to run only once on mount
  useEffect(() => {
    // Only call onDateSelect on initial mount if today is selected
    if (isSameDay(initialMonth, today) && onDateSelect) {
      onDateSelect(today)
    }
    // Run once on component mount only
  }, []) // Empty dependency array

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (date: Date, e?: React.MouseEvent) => {
    // Stop event propagation to prevent any interference
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    
    // Check if the date and time are in the past and if past dates should be disabled
    if (disablePastDates) {
      if (isPast(date) && !isToday(date)) {
        return // Don't allow selection of past dates but allow today
      }
    }

    // Always set the selected date, regardless of which date it is
    setSelectedDate(date)
    
    // Always call onDateSelect if it exists, ensuring it works for all dates including today and 28
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isHighlighted = (date: Date) => {
    return highlightedDates.some((highlightedDate) => isSameDay(date, highlightedDate))
  }

  const isPastDate = (date: Date) => {
    if (!disablePastDates) return false

    // Allow today's date to be clickable even with disablePastDates
    if (isToday(date)) return false
    
    return isBefore(date, new Date())
  }

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const now = new Date() 

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${month}-${i}`} className="h-8 w-8"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isActive = isHighlighted(date) || (selectedDate && isSameDay(date, selectedDate))
      const isTodayDate = isToday(date)
      const isPast = isPastDate(date)
      
      // Enhanced handling for today's date and day 28
      const isSpecialDay = day === 28 || isTodayDate
      
      if (isSpecialDay) {
        days.push(
          <div 
            key={`day-${month}-${day}`} 
            className="relative h-8 w-8 cursor-pointer" 
            onClick={(e) => handleDateClick(date, e)}
          >
            <div
              className={cn(
                "absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full text-sm z-10",
                isActive && "bg-[#095d40] text-white",
                isTodayDate && !isActive && "border-2 border-[#095d40]",
                isPast && !isTodayDate && "text-gray-400",
                !isActive && !isTodayDate && !isPast && "hover:bg-[#f4f4f4]",
              )}
              data-day={day}
              data-today={isTodayDate ? "true" : "false"}
            >
              {day}
            </div>
          </div>
        )
      } else {
        days.push(
          <button
            key={`day-${month}-${day}`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm",
              isActive && "bg-[#095d40] text-white",
              isTodayDate && !isActive && "border border-[#095d40]",
              isPast && "text-gray-400 cursor-not-allowed",
              !isActive && !isTodayDate && !isPast && "hover:bg-[#f4f4f4]",
            )}
            onClick={(e) => handleDateClick(date, e)}
            disabled={isPast}
            data-day={day}
          >
            {day}
          </button>
        )
      }
    }

    return days
  }

  return (
    <div className={cn("bg-white p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-6 w-6 text-[#858585]">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-6 w-6 text-[#858585]">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map((day, index) => (
          <div key={`dayname-${index}`} className="text-xs font-medium text-[#858585]">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  )
}
