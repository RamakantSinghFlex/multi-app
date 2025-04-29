"use client"

import { format, parseISO } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CreditCard, Users, Loader2 } from "lucide-react"

interface AppointmentListItemProps {
  appointment: any
  onClick: () => void
  onPayment: (appointment: any) => void
  userRole: "student" | "parent" | "tutor"
  paymentLoading: boolean
}

export function AppointmentListItem({
  appointment,
  onClick,
  onPayment,
  userRole,
  paymentLoading,
}: AppointmentListItemProps) {
  const startTime = parseISO(appointment.startTime)
  const endTime = parseISO(appointment.endTime)

  // Format participant names
  const formatParticipants = (participants: any[]) => {
    if (!participants || participants.length === 0) return ""

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

  // Get participants based on user role
  const getParticipants = () => {
    if (userRole === "student") {
      return appointment.tutors
    } else if (userRole === "tutor") {
      return appointment.students
    } else if (userRole === "parent") {
      return [...(appointment.tutors || []), ...(appointment.students || [])]
    }
    return []
  }

  // Get participant label based on user role
  const getParticipantLabel = () => {
    if (userRole === "student") {
      return "Tutor"
    } else if (userRole === "tutor") {
      return "Student"
    } else if (userRole === "parent") {
      return "Participants"
    }
    return "Participants"
  }

  // Calculate price based on tutors if price is 0 or not set
  const getPrice = () => {
    // If price is already set and valid, use it
    if (typeof appointment.price === "number" && appointment.price > 0) {
      return appointment.price
    }

    // Otherwise, calculate based on tutors and duration
    let calculatedPrice = 0

    // If we have tutors with hourly rates
    if (appointment.tutors && appointment.tutors.length > 0) {
      const startDate = new Date(appointment.startTime)
      const endDate = new Date(appointment.endTime)
      const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)

      appointment.tutors.forEach((tutor: any) => {
        const hourlyRate = tutor.hourlyRate || 50 // Default to $50/hr if not specified
        calculatedPrice += hourlyRate * durationHours
      })
    } else {
      // Default minimum price if we can't calculate
      calculatedPrice = 50
    }

    return calculatedPrice
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium truncate">{appointment.title}</h3>
            {getStatusBadge(appointment.status)}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-2 h-4 w-4" />
              <span>
                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              </span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <Users className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {getParticipantLabel()}: {formatParticipants(getParticipants())}
              </span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>${getPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0 border-t mt-4">
        <Button variant="outline" size="sm" onClick={onClick}>
          View Details
        </Button>

        {appointment.status === "awaiting_payment" && (userRole === "student" || userRole === "parent") && (
          <Button size="sm" onClick={() => onPayment(appointment)} disabled={paymentLoading}>
            {paymentLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
