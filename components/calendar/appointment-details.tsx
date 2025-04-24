"use client"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CreditCard, FileText, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cancelAppointment } from "@/lib/api/appointments"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AppointmentDetailsProps {
  appointment: any
  onClose: () => void
  onCancel: () => Promise<void>
  onPayment?: (appointment: any) => void
  userRole?: "student" | "parent" | "tutor"
  paymentLoading?: boolean
}

export function AppointmentDetails({
  appointment,
  onClose,
  onCancel,
  onPayment,
  userRole = "student",
  paymentLoading = false,
}: AppointmentDetailsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startTime = parseISO(appointment.startTime)
  const endTime = parseISO(appointment.endTime)
  const isPast = new Date(appointment.startTime) < new Date()
  const canCancel = !isPast && appointment.status !== "cancelled" && appointment.status !== "completed"

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

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-400">
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-400">
            Confirmed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-400">
            Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400">
            Completed
          </Badge>
        )
      case "awaiting_payment":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-400">
            Awaiting Payment
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCancel = async () => {
    if (!canCancel) return

    setLoading(true)
    setError(null)

    try {
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
      setError(error instanceof Error ? error.message : "Failed to cancel appointment")
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{appointment.title}</h3>
        {getStatusBadge(appointment.status)}
      </div>

      <div className="space-y-3">
        <div className="flex items-start">
          <Calendar className="mr-2 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Date</p>
            <p className="text-sm text-muted-foreground">{format(startTime, "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Clock className="mr-2 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Time</p>
            <p className="text-sm text-muted-foreground">
              {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <Users className="mr-2 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Tutors</p>
            <p className="text-sm text-muted-foreground">{formatParticipants(appointment.tutors || [])}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Users className="mr-2 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Students</p>
            <p className="text-sm text-muted-foreground">{formatParticipants(appointment.students || [])}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Users className="mr-2 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Parents</p>
            <p className="text-sm text-muted-foreground">{formatParticipants(appointment.parents || [])}</p>
          </div>
        </div>

        {appointment.price > 0 && (
          <div className="flex items-start">
            <CreditCard className="mr-2 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Price</p>
              <p className="text-sm text-muted-foreground">${appointment.price.toFixed(2)}</p>
            </div>
          </div>
        )}

        {appointment.notes && (
          <div className="flex items-start">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {canCancel && (
          <Button variant="destructive" onClick={handleCancel} disabled={loading}>
            {loading ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        )}

        {appointment.status === "awaiting_payment" &&
          (userRole === "student" || userRole === "parent") &&
          onPayment && (
            <Button onClick={() => onPayment(appointment)} disabled={paymentLoading}>
              {paymentLoading ? "Processing..." : "Pay Now"}
            </Button>
          )}

        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
