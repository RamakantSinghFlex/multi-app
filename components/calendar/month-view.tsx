"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns"
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
  // Get days in month
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Format appointment title to fit in calendar cell
  const formatTitle = (title: string) => {
    return title.length > 18 ? title.substring(0, 15) + "..." : title
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-muted">
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center font-medium text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          // Get appointments for this day
          const dayAppointments = appointments.filter((appointment) => {
            const appointmentDate = parseISO(appointment.startTime)
            return isSameDay(appointmentDate, day)
          })

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] p-1 border relative",
                !isSameMonth(day, selectedDate) && "bg-muted/50 text-muted-foreground",
                isSameDay(day, new Date()) && "bg-primary/10",
              )}
            >
              <div className="text-right p-1 text-sm">{format(day, "d")}</div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className={cn(
                      "text-xs p-1 rounded cursor-pointer truncate",
                      getAppointmentColor(appointment.status),
                    )}
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    {formatTitle(appointment.title)}
                  </div>
                ))}
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
