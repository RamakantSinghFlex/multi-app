"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Calendar, Clock, MapPin, Users, User, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { GoogleCalendarView } from "@/components/calendar/google-calendar-view"

// Mock data for appointments
const mockAppointments = [
  {
    id: "1",
    title: "Math Tutoring",
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    status: "confirmed",
    location: "Online",
    description: "Weekly math tutoring session focusing on algebra.",
    students: [{ firstName: "Alex", lastName: "Johnson" }],
    tutors: [{ firstName: "Michael", lastName: "Smith" }],
  },
  {
    id: "2",
    title: "Science Study Group",
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    status: "pending",
    location: "Library - Room 202",
    description: "Group study session for upcoming science test.",
    students: [
      { firstName: "Emma", lastName: "Davis" },
      { firstName: "Noah", lastName: "Wilson" },
    ],
    tutors: [{ firstName: "Sophia", lastName: "Brown" }],
  },
  {
    id: "3",
    title: "English Literature Review",
    startTime: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(13, 0, 0, 0)
      return date.toISOString()
    })(),
    endTime: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      date.setHours(14, 30, 0, 0)
      return date.toISOString()
    })(),
    status: "cancelled",
    location: "Online",
    description: "Review of Shakespeare's Macbeth for upcoming essay.",
    students: [{ firstName: "Olivia", lastName: "Martinez" }],
    tutors: [{ firstName: "William", lastName: "Taylor" }],
  },
  {
    id: "4",
    title: "History Exam Prep",
    startTime: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      date.setHours(16, 0, 0, 0)
      return date.toISOString()
    })(),
    endTime: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      date.setHours(17, 30, 0, 0)
      return date.toISOString()
    })(),
    status: "completed",
    location: "Study Center",
    description: "Preparation for the upcoming history midterm exam.",
    students: [{ firstName: "James", lastName: "Anderson" }],
    tutors: [{ firstName: "Charlotte", lastName: "Thomas" }],
  },
]

interface AppointmentViewProps {
  userRole: "student" | "tutor" | "parent" | "admin"
}

export function AppointmentView({ userRole }: AppointmentViewProps) {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState(mockAppointments)
  const [loading, setLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  // Format participant names
  const formatParticipants = (participants: any[]) => {
    if (!participants || participants.length === 0) return "None"

    return participants
      .map((p) => {
        if (typeof p === "string") return p
        return `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.id || "Unknown"
      })
      .join(", ")
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>
    }
  }

  // Handle appointment cancellation
  const handleCancelAppointment = () => {
    if (!selectedAppointment) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((app) => (app.id === selectedAppointment.id ? { ...app, status: "cancelled" } : app)),
      )
      setLoading(false)
      setCancelDialogOpen(false)
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been successfully cancelled.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <GoogleCalendarView userRole={userRole} />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments
            .filter((app) => ["confirmed", "pending"].includes(app.status.toLowerCase()))
            .slice(0, 3)
            .map((appointment) => {
              const startTime = parseISO(appointment.startTime)
              const endTime = parseISO(appointment.endTime)

              return (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <CardDescription>{appointment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                      {appointment.students && (
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Students: {formatParticipants(appointment.students)}</span>
                        </div>
                      )}
                      {appointment.tutors && (
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Tutors: {formatParticipants(appointment.tutors)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setCancelDialogOpen(true)
                      }}
                    >
                      Cancel Appointment
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Past Appointments</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments
            .filter((app) => ["completed", "cancelled"].includes(app.status.toLowerCase()))
            .slice(0, 3)
            .map((appointment) => {
              const startTime = parseISO(appointment.startTime)
              const endTime = parseISO(appointment.endTime)

              return (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <CardDescription>{appointment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                      {appointment.students && (
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Students: {formatParticipants(appointment.students)}</span>
                        </div>
                      )}
                      {appointment.tutors && (
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Tutors: {formatParticipants(appointment.tutors)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" className="w-full">
                      {appointment.status.toLowerCase() === "completed" ? "View Details" : "Reschedule"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
        </div>
      </div>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">{selectedAppointment.title}</h3>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{format(parseISO(selectedAppointment.startTime), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {format(parseISO(selectedAppointment.startTime), "h:mm a")} -{" "}
                      {format(parseISO(selectedAppointment.endTime), "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              <XCircle className="mr-2 h-4 w-4" />
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {loading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
