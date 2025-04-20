"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"
import { MiniCalendar } from "./mini-calendar"
import { CalendarHeader } from "./calendar-header"
import { DayView } from "./day-view"
import { WeekView } from "./week-view"
import { MonthView } from "./month-view"
import { AppointmentDetails } from "./appointment-details"
import { getAppointments } from "@/lib/api/appointments"
import { useAuth } from "@/lib/auth-context"

export type CalendarViewType = "day" | "week" | "month"

export interface GoogleCalendarViewProps {
  userRole: "student" | "tutor" | "parent"
  className?: string
}

export function GoogleCalendarView({ userRole, className = "" }: GoogleCalendarViewProps) {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewType, setViewType] = useState<CalendarViewType>("week")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Fetch appointments
  const fetchAppointments = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await getAppointments({
        [userRole + "s"]: user.id, // Note the plural form to match the API schema
      })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        // The data is now directly available as an array
        setAppointments(response.data)
      }

      // Refresh user data in the auth context
      await refreshUser()
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setError(error instanceof Error ? error.message : "Failed to load appointments")
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [user?.id])

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
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Calendar</h1>
          <p className="text-muted-foreground">
            {userRole === "student" && "View and manage your tutoring appointments"}
            {userRole === "tutor" && "View and manage your tutoring appointments"}
            {userRole === "parent" && "View and manage your children's tutoring appointments"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogTitle>
                {userRole === "student" && "Schedule an Appointment"}
                {userRole === "tutor" && "Schedule an Appointment"}
                {userRole === "parent" && "Book an Appointment"}
              </DialogTitle>
              <AppointmentCalendar
                onSuccess={() => {
                  setCreateDialogOpen(false)
                  fetchAppointments()
                }}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Sidebar with mini calendar */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <MiniCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} appointments={appointments} />

            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={goToToday}>
                Today
              </Button>
            </div>

            <div className="mt-6">
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
              onCancel={async () => {
                // Handle cancellation
                setDetailsDialogOpen(false)
                await fetchAppointments()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
