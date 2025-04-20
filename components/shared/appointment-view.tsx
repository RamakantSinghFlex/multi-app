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

interface AppointmentViewProps {
  userRole: "student" | "tutor" | "parent" | "admin"
}

export function AppointmentView({ userRole }: AppointmentViewProps) {
  const { toast } = useToast()
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
    </div>
  )
}
