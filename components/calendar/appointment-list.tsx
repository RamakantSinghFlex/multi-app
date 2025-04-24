"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { AppointmentDetails } from "./appointment-details"
import { AppointmentListItem } from "./appointment-list-item"
import { createStripeCheckoutSession } from "@/lib/api/stripe"
import { useToast } from "@/hooks/use-toast"

interface AppointmentListProps {
  appointments: any[]
  loading: boolean
  userRole: "student" | "parent" | "tutor"
  onAppointmentUpdated?: () => void
}

export function AppointmentList({ appointments, loading, userRole, onAppointmentUpdated }: AppointmentListProps) {
  const { toast } = useToast()
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "completed" &&
      new Date(appointment.startTime) > new Date(),
  )

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "completed" || new Date(appointment.startTime) <= new Date(),
  )

  const awaitingPaymentAppointments = appointments.filter((appointment) => appointment.status === "awaiting_payment")

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setDetailsDialogOpen(true)
  }

  const handlePayment = async (appointment: any) => {
    if (userRole === "tutor") return // Tutors don't make payments

    setPaymentLoading(true)
    try {
      const stripeResponse = await createStripeCheckoutSession({
        appointmentId: appointment.id,
        title: appointment.title,
        price: appointment.price || 0,
        tutorIds: appointment.tutors?.map((t: any) => (typeof t === "object" ? t.id : t)) || [],
        parentIds: appointment.parents?.map((p: any) => (typeof p === "object" ? p.id : p)) || [],
        studentIds: appointment.students?.map((s: any) => (typeof s === "object" ? s.id : s)) || [],
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
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          {(userRole === "student" || userRole === "parent") && (
            <TabsTrigger value="awaiting-payment">Awaiting Payment</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentListItem
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => handleAppointmentClick(appointment)}
                  onPayment={handlePayment}
                  userRole={userRole}
                  paymentLoading={paymentLoading}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center space-y-2">
                <p className="text-center text-muted-foreground">No upcoming appointments found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastAppointments.map((appointment) => (
                <AppointmentListItem
                  key={appointment.id}
                  appointment={appointment}
                  onClick={() => handleAppointmentClick(appointment)}
                  onPayment={handlePayment}
                  userRole={userRole}
                  paymentLoading={paymentLoading}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center space-y-2">
                <p className="text-center text-muted-foreground">No past appointments found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {(userRole === "student" || userRole === "parent") && (
          <TabsContent value="awaiting-payment" className="space-y-4">
            {awaitingPaymentAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {awaitingPaymentAppointments.map((appointment) => (
                  <AppointmentListItem
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() => handleAppointmentClick(appointment)}
                    onPayment={handlePayment}
                    userRole={userRole}
                    paymentLoading={paymentLoading}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex h-40 flex-col items-center justify-center space-y-2">
                  <p className="text-center text-muted-foreground">No appointments awaiting payment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Appointment details dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Appointment Details</DialogTitle>
          {selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              onClose={() => setDetailsDialogOpen(false)}
              onCancel={async () => {
                setDetailsDialogOpen(false)
                if (onAppointmentUpdated) {
                  onAppointmentUpdated()
                }
              }}
              onPayment={handlePayment}
              userRole={userRole}
              paymentLoading={paymentLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
