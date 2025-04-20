"use client"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, User, FileText, DollarSign } from "lucide-react"
import { cancelAppointment } from "@/lib/api/appointments"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AppointmentDetailsProps {
  appointment: any
  onClose: () => void
  onCancel: () => Promise<void>
}

export function AppointmentDetails({ appointment, onClose, onCancel }: AppointmentDetailsProps) {
  const { toast } = useToast()
  const [cancelling, setCancelling] = useState(false)

  const startTime = parseISO(appointment.startTime)
  const endTime = parseISO(appointment.endTime)

  // Format participant names
  const formatParticipants = (participants: any[]) => {
    if (!participants || participants.length === 0) return "None"

    return participants
      .map((p) => {
        if (typeof p === "string") return p
        return `${p.firstName || ""} ${p.lastName || ""}`.trim()
      })
      .join(", ")
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-400">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-400">Confirmed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-400">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-400">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Handle appointment cancellation
  const handleCancel = async () => {
    if (appointment.status === "cancelled") {
      toast({
        title: "Already Cancelled",
        description: "This appointment is already cancelled.",
      })
      return
    }

    if (appointment.status === "completed") {
      toast({
        title: "Cannot Cancel",
        description: "Completed appointments cannot be cancelled.",
      })
      return
    }

    try {
      setCancelling(true)
      const response = await cancelAppointment(appointment.id)

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })

      await onCancel()
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel appointment",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{appointment.title}</h3>
        {getStatusBadge(appointment.status)}
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Date</p>
            <p className="text-sm">{format(startTime, "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Time</p>
            <p className="text-sm">
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </p>
          </div>
        </div>

        {appointment.students && (
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Students</p>
              <p className="text-sm">{formatParticipants(appointment.students)}</p>
            </div>
          </div>
        )}

        {appointment.tutors && (
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Tutors</p>
              <p className="text-sm">{formatParticipants(appointment.tutors)}</p>
            </div>
          </div>
        )}

        {appointment.parents && appointment.parents.length > 0 && (
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Parents</p>
              <p className="text-sm">{formatParticipants(appointment.parents)}</p>
            </div>
          </div>
        )}

        {appointment.payment && (
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Payment</p>
              <p className="text-sm">
                ${appointment.payment.amount} ({appointment.payment.status})
              </p>
            </div>
          </div>
        )}

        {appointment.notes && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {appointment.status !== "cancelled" && appointment.status !== "completed" && (
          <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        )}
      </div>
    </div>
  )
}
