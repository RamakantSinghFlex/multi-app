"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAppointments } from "@/lib/api/appointments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { format, parseISO, isSameDay } from "date-fns"
import { CalendarIcon, Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"
import { Badge } from "@/components/ui/badge"

export default function TutorSchedulePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchAppointments = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await getAppointments(1, 100, { tutor: user.id })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setAppointments(response.data.docs)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
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

  // Filter appointments for the selected date
  const appointmentsForSelectedDate = appointments.filter((appointment) =>
    isSameDay(parseISO(appointment.startTime), selectedDate),
  )

  // Get dates that have appointments for highlighting in the calendar
  const appointmentDates = appointments.map(
    (appointment) => new Date(parseISO(appointment.startTime).setHours(0, 0, 0, 0)),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Schedule</h1>
          <p className="text-muted-foreground">Manage your tutoring schedule and appointments</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                appointment: appointmentDates,
              }}
              modifiersStyles={{
                appointment: {
                  fontWeight: "bold",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  color: "rgb(22, 163, 74)",
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Appointments for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : appointmentsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {appointmentsForSelectedDate.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{appointment.title}</h3>
                      <Badge
                        variant="outline"
                        className={
                          appointment.status === "confirmed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : appointment.status === "pending"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : appointment.status === "cancelled"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>
                        Time: {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                        {format(parseISO(appointment.endTime), "h:mm a")}
                      </p>
                      <p>
                        Student: {appointment.student?.firstName} {appointment.student?.lastName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <p>No appointments scheduled for this date</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
