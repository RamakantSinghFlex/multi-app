"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, getDay } from "date-fns"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthViewProps {
  selectedDate: Date
  appointments: any[]
  onAppointmentClick: (appointment: any) => void
  getAppointmentColor: (status: string) => string
  loading: boolean
}

export function MonthView({
  selectedDate,
  appointments,
  onAppointmentClick,
  getAppointmentColor,
  loading,
}: MonthViewProps) {
  // Generate days for the month view
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate the starting day offset (0 = Sunday, 1 = Monday, etc.)
  const startingDayOffset = getDay(monthStart)

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.startTime)
      return isSameDay(appointmentDate, day)
    })
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Get day names for header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="min-h-[600px]">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayNames.map((day, i) => (
          <div key={i} className="py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: startingDayOffset }).map((_, i) => (
          <div key={`empty-start-${i}`} className="border rounded-md bg-muted/20"></div>
        ))}

        {/* Days of the month */}
        {days.map((day) => {
          const dayAppointments = getAppointmentsForDay(day)
          const isToday = isSameDay(day, new Date())
          const isCurrentMonth = isSameMonth(day, selectedDate)

          return (
            <div
              key={day.toString()}
              className={cn(
                "border rounded-md p-1 min-h-[100px]",
                isToday && "bg-primary/10 border-primary/50",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
              )}
            >
              <div className="text-right text-sm font-medium p-1">{format(day, "d")}</div>

              <div className="space-y-1 mt-1">
                {dayAppointments.slice(0, 3).map((appointment) => {
                  const startTime = parseISO(appointment.startTime)

                  return (
                    <div
                      key={appointment.id}
                      className={cn(
                        "rounded px-1 py-0.5 text-xs truncate cursor-pointer",
                        getAppointmentColor(appointment.status),
                      )}
                      onClick={() => onAppointmentClick(appointment)}
                    >
                      {format(startTime, "h:mm a")} - {appointment.title}
                    </div>
                  )
                })}

                {dayAppointments.length > 3 && (
                  <div className="text-xs text-center text-muted-foreground">+{dayAppointments.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
