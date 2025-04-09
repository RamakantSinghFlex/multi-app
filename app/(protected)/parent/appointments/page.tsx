"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAppointments, cancelAppointment } from "@/lib/api/appointments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { format, parseISO, isAfter, isBefore } from "date-fns"
import { Calendar, Clock, User, Users, AlertCircle, Loader2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"
import { sanitizeHtml } from "@/lib/utils"

export default function ParentAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

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
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
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
          <h1 className="text-2xl font-bold md:text-3xl">Appointments</h1>
          <p className="text-muted-foreground">Manage your tutoring appointments</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
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
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
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
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <CardDescription>{format(parseISO(appointment.startTime), "EEEE, MMMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                            {format(parseISO(appointment.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(appointment.notes) }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4">
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
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
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No past appointments</h3>
                <p className="text-muted-foreground">You don't have any past appointments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <CardDescription>{format(parseISO(appointment.startTime), "EEEE, MMMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                            {format(parseISO(appointment.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(appointment.notes) }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No cancelled appointments</h3>
                <p className="text-muted-foreground">You don't have any cancelled appointments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cancelledAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <CardDescription>{format(parseISO(appointment.startTime), "EEEE, MMMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                            {format(parseISO(appointment.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
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
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(appointment.notes) }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
