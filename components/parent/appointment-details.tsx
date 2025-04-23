"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAppointments } from "@/lib/api/appointments"
import { AppointmentDetails } from "@/components/calendar/appointment-details"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function ParentAppointmentDetails({ id }: { id: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAppointment() {
      if (!user?.id) return

      try {
        setLoading(true)
        const response = await getAppointments({ parent: user.id })

        if (response.error) {
          throw new Error(response.error)
        }

        const foundAppointment = response.data?.find((appt) => appt.id === id)

        if (!foundAppointment) {
          throw new Error("Appointment not found")
        }

        setAppointment(foundAppointment)
      } catch (err) {
        console.error("Error fetching appointment:", err)
        setError(err instanceof Error ? err.message : "Failed to load appointment")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load appointment",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [id, user?.id, toast])

  const handleClose = () => {
    router.push("/parent/appointments")
  }

  const handleCancel = async () => {
    // After cancellation, refresh the appointment data
    if (!user?.id) return

    try {
      const response = await getAppointments({ parent: user.id })

      if (response.error) {
        throw new Error(response.error)
      }

      const updatedAppointment = response.data?.find((appt) => appt.id === id)

      if (updatedAppointment) {
        setAppointment(updatedAppointment)
      } else {
        // If appointment is no longer found (unlikely), go back to list
        router.push("/parent/appointments")
      }
    } catch (err) {
      console.error("Error refreshing appointment data:", err)
      toast({
        title: "Error",
        description: "Failed to refresh appointment data",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-end space-x-2 pt-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Appointment Not Found</h3>
              <p className="text-muted-foreground mt-2">
                {error || "The appointment you're looking for doesn't exist or you don't have permission to view it."}
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Back to Appointments
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6">
          <AppointmentDetails appointment={appointment} onClose={handleClose} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}
