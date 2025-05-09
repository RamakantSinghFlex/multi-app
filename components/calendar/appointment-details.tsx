"use client"

import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, DollarSign, CreditCard } from "lucide-react"
import { cancelAppointment } from "@/lib/api/appointments"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ParticipantDisplay } from "@/components/shared/participant-display"
import { useAuth } from "@/lib/auth-context"
import { createStripeCheckoutSession } from "@/lib/api/stripe"

interface AppointmentDetailsProps {
  appointment: any
  onClose: () => void
  onCancel: () => Promise<void>
  userRole?: string
  paymentLoading?: boolean
}

export function AppointmentDetails({
  appointment,
  onClose,
  onCancel,
  userRole,
  paymentLoading,
}: AppointmentDetailsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [cancelling, setCancelling] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const startTime = parseISO(appointment.startTime)
  const endTime = parseISO(appointment.endTime)

  const userRoles = user?.roles || []
  const isStudentOrParent = userRoles.includes("student") || userRoles.includes("parent")
  const needsPayment = appointment.status === "awaiting_payment" && isStudentOrParent

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
      case "awaiting_payment":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-400">Awaiting Payment</Badge>
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

  // Handle payment
  const handlePayment = async () => {
    try {
      setProcessingPayment(true)

      // Get tutor, student, and parent IDs from the appointment
      const tutorIds = appointment.tutors.map((tutor: any) => (typeof tutor === "string" ? tutor : tutor.id))

      const studentIds = appointment.students.map((student: any) =>
        typeof student === "string" ? student : student.id,
      )

      const parentIds =
        appointment.parents?.map((parent: any) => (typeof parent === "string" ? parent : parent.id)) || []

      // Create a Stripe checkout session
      const stripeResponse = await createStripeCheckoutSession({
        appointmentId: appointment.id,
        title: appointment.title,
        price: appointment.price || 0,
        tutorIds,
        parentIds,
        studentIds,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notes: appointment.notes || "",
      })

      if (stripeResponse.error) {
        throw new Error(stripeResponse.error)
      }

      // Redirect to Stripe checkout
      if (stripeResponse.data?.url) {
        window.location.href = stripeResponse.data.url
      } else {
        throw new Error("No checkout URL returned from Stripe")
      }
    } catch (error) {
      console.error("Error creating payment session:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment session",
        variant: "destructive",
      })
      setProcessingPayment(false)
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

        {/* Use the shared ParticipantDisplay component */}
        {appointment.students && appointment.students.length > 0 && (
          <ParticipantDisplay label="Students" participantType="student" participants={appointment.students} />
        )}

        {appointment.tutors && appointment.tutors.length > 0 && (
          <ParticipantDisplay label="Tutors" participantType="tutor" participants={appointment.tutors} />
        )}

        {appointment.parents && appointment.parents.length > 0 && (
          <ParticipantDisplay label="Parents" participantType="parent" participants={appointment.parents} />
        )}

        {appointment.payment && (
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Payment</p>
              <p className="text-sm">
                ${(appointment.payment.amount / 100).toFixed(2)} ({appointment.payment.status})
              </p>
            </div>
          </div>
        )}

        {appointment.price && !appointment.payment && (
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Price</p>
              <p className="text-sm">${appointment.price.toFixed(2)}</p>
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

        {needsPayment && (
          <Button variant="default" onClick={handlePayment} disabled={processingPayment} className="gap-2">
            <CreditCard className="h-4 w-4" />
            {processingPayment ? "Processing..." : "Pay Now"}
          </Button>
        )}

        {appointment.status !== "cancelled" && appointment.status !== "completed" && (
          <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        )}
      </div>
    </div>
  )
}
