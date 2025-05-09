"use client"

import { format, parseISO, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  selectedDate: Date
  appointments: any[]
  onAppointmentClick: (appointment: any) => void
  getAppointmentColor: (status: string) => string
  loading: boolean
}

export function WeekView({
  selectedDate,
  appointments,
  onAppointmentClick,
  getAppointmentColor,
  loading,
}: WeekViewProps) {
  // Generate days for the week
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Generate time slots for each day (24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Format participant names
  const formatParticipants = (participants: any[]) => {
    if (!participants || participants.length === 0) return ""

    return participants
      .map((p) => {
        if (typeof p === "string") return p
        return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.id || "Unknown"
      })
      .join(", ")
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="relative min-h-[600px] overflow-y-auto">
      <div className="sticky top-0 z-20 grid grid-cols-[60px_repeat(7,1fr)] bg-background">
        <div className="border-b border-r p-2"></div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn("border-b border-r p-2 text-center", isSameDay(day, new Date()) && "bg-primary/10")}
          >
            <div className="font-medium">{format(day, "EEE")}</div>
            <div className="text-sm text-muted-foreground">{format(day, "MMM d")}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        {/* Time labels */}
        <div className="border-r">
          {hours.map((hour) => {
            // Create a date object for this hour
            const timeDate = new Date()
            timeDate.setHours(hour, 0, 0, 0)

            return (
              <div key={hour} className="relative h-16">
                <div className="absolute top-0 right-2 text-xs text-muted-foreground">{format(timeDate, "h:mm a")}</div>
                <div className="h-full border-b"></div>
              </div>
            )
          })}
        </div>

        {/* Day columns */}
        {days.map((day) => (
          <div key={day.toString()} className="relative border-r">
            {/* Hour grid lines */}
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b"></div>
            ))}

            {/* Current time indicator */}
            {isSameDay(day, new Date()) && (
              <div
                className="absolute left-0 right-0 border-t border-red-500 z-10"
                style={{
                  top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 60) * 64}px`,
                }}
              >
                <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500"></div>
              </div>
            )}

            {/* Appointments for this day */}
            {appointments
              .filter((appointment) => {
                const appointmentDate = parseISO(appointment.startTime)
                return isSameDay(appointmentDate, day)
              })
              .map((appointment) => {
                const startTime = parseISO(appointment.startTime)
                const endTime = parseISO(appointment.endTime)
                const durationMinutes = differenceInMinutes(endTime, startTime)
                const height = (durationMinutes / 60) * 64 // 64px = 1 hour

                // Calculate top position based on start time
                const startHour = startTime.getHours()
                const startMinute = startTime.getMinutes()
                const topPosition = startHour * 64 + (startMinute / 60) * 64

                return (
                  <div
                    key={appointment.id}
                    className={cn(
                      "absolute left-0.5 right-0.5 rounded-md border p-1 shadow-sm cursor-pointer transition-opacity hover:opacity-90 z-10",
                      getAppointmentColor(appointment.status),
                    )}
                    style={{
                      top: `${topPosition}px`,
                      height: `${Math.max(height, 20)}px`, // Ensure minimum height for very short appointments
                    }}
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <div className="text-xs font-medium truncate">{appointment.title}</div>
                    <div className="text-xs truncate">
                      {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                    </div>
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}
