"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAppointments, cancelAppointment } from "@/lib/api/appointments"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  format,
  parseISO,
  isAfter,
  isBefore,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Loader2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"

// Fallback sanitize function in case the import fails
const simpleSanitize = (html) => {
  if (!html) return ""
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/on\w+=\w+/gi, "")
}

export default function ParentAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [view, setView] = useState<"calendar" | "list">("calendar")

  const fetchAppointments = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await getAppointments(1, 100, { parent: user.id })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setAppointments(response.data.docs)
      }
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

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await cancelAppointment(id)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })

      // Refresh appointments
      fetchAppointments()
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Confirmed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "completed" &&
      isAfter(parseISO(appointment.startTime), new Date()),
  )

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "completed" || isBefore(parseISO(appointment.startTime), new Date()),
  )

  const cancelledAppointments = appointments.filter((appointment) => appointment.status === "cancelled")

  // Calendar navigation
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  // Calendar days generation
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = monthStart
  const endDate = monthEnd

  const dateRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((appointment) => isSameDay(parseISO(appointment.startTime), day))
  }

  // Get appointments for selected date
  const selectedDateAppointments = getAppointmentsForDay(selectedDate)

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading appointments...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <CalendarIcon className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Failed to load appointments</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchAppointments}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Calendar</h1>
          <p className="text-muted-foreground">View and manage your children's tutoring appointments</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("calendar")}
            className={view === "calendar" ? "bg-primary/10" : ""}
          >
            Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("list")}
            className={view === "list" ? "bg-primary/10" : ""}
          >
            List
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogTitle>Book an Appointment</DialogTitle>
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

      {view === "calendar" ? (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM, yyyy")}</h2>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm">
                  Month
                </Button>
                <Button variant="outline" size="sm">
                  Search
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="py-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {/* Fill in empty cells for days of the week before the first of the month */}
              {Array.from({ length: getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1 }).map((_, index) => (
                <div key={`empty-start-${index}`} className="min-h-[100px] p-2 border-r border-b bg-gray-50"></div>
              ))}

              {/* Calendar days */}
              {dateRange.map((day, dayIdx) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[100px] p-2 border-r border-b relative ${
                      isSelected ? "bg-primary/5" : ""
                    } ${isToday ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div
                      className={`text-sm font-medium ${isToday ? "text-primary rounded-full w-6 h-6 flex items-center justify-center bg-primary text-white" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="mt-1 space-y-1 max-h-[80px] overflow-hidden">
                      {dayAppointments.slice(0, 2).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`text-xs p-1 rounded truncate ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {format(parseISO(appointment.startTime), "h:mm a")} - {appointment.title}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Fill in empty cells for days of the week after the end of the month */}
              {Array.from({ length: getDay(monthEnd) === 0 ? 0 : 7 - getDay(monthEnd) }).map((_, index) => (
                <div key={`empty-end-${index}`} className="min-h-[100px] p-2 border-r border-b bg-gray-50"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No upcoming appointments</h3>
                  <p className="text-muted-foreground mb-4">You don't have any upcoming appointments scheduled.</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <div className="p-4 border-l-4 border-primary">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{appointment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(appointment.startTime), "EEEE, MMMM d, yyyy")}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="space-y-3 mt-3">
                        <div className="flex items-start space-x-2">
                          <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                              {format(parseISO(appointment.endTime), "h:mm a")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              Tutor: {appointment.tutor.firstName} {appointment.tutor.lastName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              Student: {appointment.student.firstName} {appointment.student.lastName}
                            </p>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="pt-2 text-sm">
                            <p className="font-medium">Notes:</p>
                            <div
                              className="text-muted-foreground"
                              dangerouslySetInnerHTML={{ __html: simpleSanitize(appointment.notes) }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="w-full text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No past appointments</h3>
                  <p className="text-muted-foreground">You don't have any past appointments.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <div className="p-4 border-l-4 border-gray-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{appointment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(appointment.startTime), "EEEE, MMMM d, yyyy")}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="space-y-3 mt-3">
                        <div className="flex items-start space-x-2">
                          <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                              {format(parseISO(appointment.endTime), "h:mm a")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              Tutor: {appointment.tutor.firstName} {appointment.tutor.lastName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              Student: {appointment.student.firstName} {appointment.student.lastName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No cancelled appointments</h3>
                  <p className="text-muted-foreground">You don't have any cancelled appointments.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cancelledAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <div className="p-4 border-l-4 border-red-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{appointment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(appointment.startTime), "EEEE, MMMM d, yyyy")}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="space-y-3 mt-3">
                        <div className="flex items-start space-x-2">
                          <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                              {format(parseISO(appointment.endTime), "h:mm a")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              Tutor: {appointment.tutor.firstName} {appointment.tutor.lastName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">
                              Student: {appointment.student.firstName} {appointment.student.lastName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
