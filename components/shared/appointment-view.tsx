"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// Update the import section to include the necessary date-fns functions
import { format, parseISO, isAfter, isBefore, addMonths, subMonths, isSameDay } from "date-fns"
import { CalendarIcon, Plus, Loader2, Users, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"
import { cancelAppointment, getAppointments } from "@/lib/api/appointments"
import { CalendarView } from "@/components/ui/calendar-view"

// Fallback sanitize function in case the import fails
const simpleSanitize = (html: string) => {
  if (!html) return ""
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/on\w+=\w+/gi, "")
}

export interface AppointmentViewProps {
  userRole: "student" | "tutor" | "parent"
  fetchFromApi?: boolean
  className?: string
}

// Add this helper function to better display multiple participants

// Add this function to format participant names
const formatParticipantNames = (participants: any[]) => {
  if (!participants || !Array.isArray(participants) || participants.length === 0) return "None"

  if (participants.length === 1) {
    const participant = participants[0]
    if (typeof participant === "string") return participant
    if (participant.firstName || participant.lastName) {
      return `${participant.firstName || ""} ${participant.lastName || ""}`.trim()
    }
    return participant.id || "Unknown"
  }

  const firstParticipant = participants[0]
  let firstName = ""

  if (typeof firstParticipant === "string") {
    firstName = firstParticipant
  } else if (firstParticipant.firstName || firstParticipant.lastName) {
    firstName = `${firstParticipant.firstName || ""} ${firstParticipant.lastName || ""}`.trim()
  } else {
    firstName = firstParticipant.id || "Unknown"
  }

  return `${firstName} +${participants.length - 1} more`
}

export default function AppointmentView({ userRole, fetchFromApi = true, className = "" }: AppointmentViewProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [highlightedDates, setHighlightedDates] = useState<Date[]>([])

  // Update the fetchAppointments function to handle the new response format
  const fetchAppointments = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      if (fetchFromApi) {
        // Fetch from API
        const response = await getAppointments({
          [userRole + "s"]: user.id, // Note the plural form to match the API schema
        })

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          // The data is now directly available as an array
          setAppointments(response.data)

          // Extract dates for highlighting in the calendar
          const dates = response.data.map((appointment: any) => new Date(appointment.startTime))
          setHighlightedDates(dates)
        }
      } else {
        // Get appointments directly from the user object
        const userAppointments = user.appointments || []
        setAppointments(userAppointments)

        // Extract dates for highlighting in the calendar
        const dates = userAppointments.map((appointment: any) => new Date(appointment.startTime))
        setHighlightedDates(dates)
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
      if (fetchFromApi) {
        const response = await cancelAppointment(id)

        if (response.error) {
          throw new Error(response.error)
        }
      } else {
        // Just update the local state for demo/development
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === id ? { ...appointment, status: "cancelled" } : appointment,
          ),
        )
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

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.startTime)
      return isSameDay(appointmentDate, day)
    })
  }

  // Get appointments for selected date
  const selectedDateAppointments = getAppointmentsForDay(selectedDate)

  // Helper function to get the first item from an array or return null
  const getFirstItem = (array: any[] | undefined) => {
    if (!array || !Array.isArray(array) || array.length === 0) return null
    return array[0]
  }

  // Handle date selection from the calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

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
    <div className={`space-y-6 ${className}`}>
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

      {view === "calendar" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar with mini calendar */}
          <Card className="md:col-span-1">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Select Date</h3>
              <CalendarView
                initialMonth={currentMonth}
                onDateSelect={handleDateSelect}
                highlightedDates={highlightedDates}
                disablePastDates={false} // Allow selecting any date including today and past dates
              />

              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={goToToday}>
                  Today
                </Button>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-[#095d40] mr-2"></div>
                    <span className="text-sm">Appointment</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full border border-[#095d40] mr-2"></div>
                    <span className="text-sm">Today</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main content area */}
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
              </div>

              {selectedDateAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No appointments</h3>
                  <p className="text-muted-foreground mb-4">You don't have any appointments scheduled for this day.</p>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-[#095d40] text-white hover:bg-[#02342e]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateAppointments.map((appointment) => (
                    <Card key={`selected-${appointment.id}`} className="overflow-hidden">
                      <div className="p-4 border-l-4 border-primary">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-sm font-medium">{appointment.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                              {format(parseISO(appointment.endTime), "h:mm a")}
                            </p>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="space-y-3 mt-3">
                          {appointment.students && appointment.students.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <p className="text-sm">
                                  Student{appointment.students.length > 1 ? "s" : ""}:{" "}
                                  {formatParticipantNames(appointment.students)}
                                </p>
                              </div>
                            </div>
                          )}

                          {appointment.tutors && appointment.tutors.length > 0 && (
                            <div className="flex items-start space-x-2">
                              <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <p className="text-sm">
                                  Tutor{appointment.tutors.length > 1 ? "s" : ""}:{" "}
                                  {formatParticipantNames(appointment.tutors)}
                                </p>
                              </div>
                            </div>
                          )}

                          {appointment.payment && (
                            <div className="flex items-start space-x-2">
                              <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <p className="text-sm">
                                  Payment: ${appointment.payment.amount} ({appointment.payment.status})
                                </p>
                              </div>
                            </div>
                          )}

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
            </CardContent>
          </Card>
        </div>
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
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-[#095d40] text-white hover:bg-[#02342e]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {userRole === "parent" ? "Book Appointment" : "Schedule Appointment"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.map((appointment) => (
                  <Card key={`upcoming-${appointment.id}`} className="overflow-hidden">
                    <div className="p-4 border-l-4 border-primary">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-medium">{appointment.title}</h3>
                          <p className="text-xs text-muted-foreground">
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

                        {appointment.students && appointment.students.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Student{appointment.students.length > 1 ? "s" : ""}:{" "}
                                {formatParticipantNames(appointment.students)}
                              </p>
                            </div>
                          </div>
                        )}

                        {appointment.tutors && appointment.tutors.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Tutor{appointment.tutors.length > 1 ? "s" : ""}:{" "}
                                {formatParticipantNames(appointment.tutors)}
                              </p>
                            </div>
                          </div>
                        )}

                        {appointment.payment && (
                          <div className="flex items-start space-x-2">
                            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Payment: ${appointment.payment.amount} ({appointment.payment.status})
                              </p>
                            </div>
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
                  <Card key={`past-${appointment.id}`} className="overflow-hidden">
                    <div className="p-4 border-l-4 border-gray-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-medium">{appointment.title}</h3>
                          <p className="text-xs text-muted-foreground">
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

                        {appointment.students && appointment.students.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Student{appointment.students.length > 1 ? "s" : ""}:{" "}
                                {formatParticipantNames(appointment.students)}
                              </p>
                            </div>
                          </div>
                        )}

                        {appointment.tutors && appointment.tutors.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Tutor{appointment.tutors.length > 1 ? "s" : ""}:{" "}
                                {formatParticipantNames(appointment.tutors)}
                              </p>
                            </div>
                          </div>
                        )}

                        {appointment.payment && (
                          <div className="flex items-start space-x-2">
                            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Payment: ${appointment.payment.amount} ({appointment.payment.status})
                              </p>
                            </div>
                          </div>
                        )}
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
                  <Card key={`cancelled-${appointment.id}`} className="overflow-hidden">
                    <div className="p-4 border-l-4 border-red-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-medium">{appointment.title}</h3>
                          <p className="text-xs text-muted-foreground">
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

                        {appointment.students && appointment.students.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Student{appointment.students.length > 1 ? "s" : ""}:{" "}
                                {formatParticipantNames(appointment.students)}
                              </p>
                            </div>
                          </div>
                        )}

                        {appointment.tutors && appointment.tutors.length > 0 && (
                          <div className="flex items-start space-x-2">
                            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Tutor{appointment.tutors.length > 1 ? "s" : ""}:{" "}
                                {formatParticipantNames(appointment.tutors)}
                              </p>
                            </div>
                          </div>
                        )}

                        {appointment.payment && (
                          <div className="flex items-start space-x-2">
                            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                Payment: ${appointment.payment.amount} ({appointment.payment.status})
                              </p>
                            </div>
                          </div>
                        )}
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
