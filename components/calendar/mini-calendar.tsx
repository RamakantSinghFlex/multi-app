"use client"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MiniCalendarProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  appointments: any[]
}

export function MiniCalendar({ selectedDate, onDateChange, appointments }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate))

  // Update current month when selected date changes
  useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(selectedDate))
    }
  }, [selectedDate])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Generate days for the current month view
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names for header
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Check if a day has appointments
  const hasAppointments = (day: Date) => {
    return appointments.some((appointment) => {
      const appointmentDate = parseISO(appointment.startTime)
      return isSameDay(appointmentDate, day)
    })
  }

  // Calculate the starting day offset (0 = Sunday, 1 = Monday, etc.)
  const startingDayOffset = monthStart.getDay()

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {dayNames.map((day, i) => (
          <div key={i} className="text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: startingDayOffset }).map((_, i) => (
          <div key={`empty-start-${i}`} className="h-7 w-7"></div>
        ))}

        {/* Days of the month */}
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const hasEvents = hasAppointments(day)

          return (
            <button
              key={day.toString()}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                isSelected && "bg-primary text-primary-foreground font-medium",
                !isSelected && hasEvents && "font-medium",
                !isSelected && "hover:bg-muted",
              )}
              onClick={() => onDateChange(day)}
            >
              {format(day, "d")}
              {hasEvents && !isSelected && <div className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary"></div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
