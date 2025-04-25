"use client"

import { useState, useMemo } from "react"
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { CalendarHeader } from "./calendar-header"
import { DayView } from "./day-view"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"
import { AppointmentDetails } from "./appointment-details"

export type CalendarViewType = "day" | "week" | "month"

interface GoogleCalendarViewProps {
  userRole: "student" | "tutor" | "parent"
  className?: string
  appointments: any[]
  loading: boolean
}

export function GoogleCalendarView({ userRole, className = "", appointments, loading }: GoogleCalendarViewProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewType, setViewType] = useState<CalendarViewType>("week")
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Navigation functions
  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const goToPrevious = () => {
    if (viewType === "day") {
      setSelectedDate(subDays(selectedDate, 1))
    } else if (viewType === "week") {
      setSelectedDate(subDays(selectedDate, 7))
    } else if (viewType === "month") {
      setSelectedDate(subMonths(selectedDate, 1))
    }
  }

  const goToNext = () => {
    if (viewType === "day") {
      setSelectedDate(addDays(selectedDate, 1))
    } else if (viewType === "week") {
      setSelectedDate(addDays(selectedDate, 7))
    } else if (viewType === "month") {
      setSelectedDate(addMonths(selectedDate, 1))
    }
  }

  // Format the current view's title
  const viewTitle = useMemo(() => {
    if (viewType === "day") {
      return format(selectedDate, "MMMM d, yyyy")
    } else if (viewType === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 })
      const end = endOfWeek(selectedDate, { weekStartsOn: 0 })
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`
      } else if (start.getFullYear() === end.getFullYear()) {
        return `${format(start, "MMMM d")} - ${format(end, "MMMM d, yyyy")}`
      } else {
        return `${format(start, "MMMM d, yyyy")} - ${format(end, "MMMM d, yyyy")}`
      }
    } else {
      return format(selectedDate, "MMMM yyyy")
    }
  }, [selectedDate, viewType])

  // Get appointments for the current view
  const visibleAppointments = useMemo(() => {
    if (viewType === "day") {
      return appointments.filter((appointment) => {
        const appointmentDate = parseISO(appointment.startTime)
        return isSameDay(appointmentDate, selectedDate)
      })
    } else if (viewType === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 })
      const end = endOfWeek(selectedDate, { weekStartsOn: 0 })
      return appointments.filter((appointment) => {
        const appointmentDate = parseISO(appointment.startTime)
        return !isBefore(appointmentDate, start) && !isAfter(appointmentDate, end)
      })
    } else {
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)
      return appointments.filter((appointment) => {
        const appointmentDate = parseISO(appointment.startTime)
        return !isBefore(appointmentDate, start) && !isAfter(appointmentDate, end)
      })
    }
  }, [appointments, selectedDate, viewType])

  // Handle appointment click
  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setDetailsDialogOpen(true)
  }

  // Get color based on appointment status
  const getAppointmentColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 border-yellow-400 text-yellow-800"
      case "confirmed":
        return "bg-green-100 border-green-400 text-green-800"
      case "cancelled":
        return "bg-red-100 border-red-400 text-red-800"
      case "completed":
        return "bg-blue-100 border-blue-400 text-blue-800"
      default:
        return "bg-gray-100 border-gray-400 text-gray-800"
    }
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Sidebar with mini calendar */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Badge className="bg-green-100 text-green-800 border-green-400">Confirmed</Badge>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-400">Pending</Badge>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-red-100 text-red-800 border-red-400">Cancelled</Badge>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-400">Completed</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main calendar area */}
        <div className="md:col-span-6">
          <Card className="p-4">
            <CalendarHeader
              viewTitle={viewTitle}
              viewType={viewType}
              onViewChange={setViewType}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onToday={goToToday}
            />

            <Tabs value={viewType} onValueChange={(value) => setViewType(value as CalendarViewType)} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>

              <TabsContent value="day" className="mt-4">
                <DayView
                  selectedDate={selectedDate}
                  appointments={visibleAppointments}
                  onAppointmentClick={handleAppointmentClick}
                  getAppointmentColor={getAppointmentColor}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="week" className="mt-4">
                <WeekView
                  selectedDate={selectedDate}
                  appointments={visibleAppointments}
                  onAppointmentClick={handleAppointmentClick}
                  getAppointmentColor={getAppointmentColor}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="month" className="mt-4">
                <MonthView
                  selectedDate={selectedDate}
                  appointments={visibleAppointments}
                  onAppointmentClick={handleAppointmentClick}
                  getAppointmentColor={getAppointmentColor}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Appointment details dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Appointment Details</DialogTitle>
          {selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              onClose={() => setDetailsDialogOpen(false)}
              onCancel={() => setDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
