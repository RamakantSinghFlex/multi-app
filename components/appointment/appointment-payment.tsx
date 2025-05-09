"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyStripePayment, updateAppointmentPayment } from "@/lib/api/stripe"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

export function AppointmentPaymentStatus() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"success" | "pending" | "error">("pending")
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const requestMadeRef = useRef(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      setStatus("error")
      setLoading(false)
      toast({
        title: "Error",
        description: "No session ID found in URL",
        variant: "destructive",
      })
      return
    }

    // Prevent duplicate requests
    if (requestMadeRef.current) {
      return
    }

    const verifyPayment = async () => {
      try {
        requestMadeRef.current = true
        const response = await verifyStripePayment(sessionId)

        if (response.error) {
          throw new Error(response.error)
        }

        const paymentStatus = response.data?.status
        const apptId = response.data?.appointmentId

        if (apptId) {
          setAppointmentId(apptId)

          // Update appointment with payment information
          if (paymentStatus === "complete") {
            await updateAppointmentPayment(apptId, {
              paymentId: sessionId,
              status: "paid",
              amount: response.data?.amount_total || 0,
              currency: response.data?.currency || "usd",
              paymentMethod: response.data?.paymentMethod || "card",
              paymentDate: new Date().toISOString(),
            })
          }
        }

        if (paymentStatus === "complete") {
          setStatus("success")
          toast({
            title: "Payment Successful",
            description: "Your appointment has been booked successfully",
          })
        } else if (paymentStatus === "pending") {
          setStatus("pending")
          toast({
            title: "Payment Pending",
            description: "Your payment is being processed",
          })
        } else {
          setStatus("error")
          toast({
            title: "Payment Failed",
            description: "There was an issue with your payment",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setStatus("error")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to verify payment",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams, toast])

  const handleViewAppointment = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      // Fallback if no user or roles
      if (appointmentId) {
        router.push(`/appointments/${appointmentId}`)
      } else {
        router.push("/appointments")
      }
      return
    }

    const userRole = user.roles[0]
    if (appointmentId) {
      router.push(`/${userRole}/appointments/${appointmentId}`)
    } else {
      router.push(`/${userRole}/appointments`)
    }
  }

  const handleGoToDashboard = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      // Fallback if no user or roles
      router.push("/")
      return
    }

    const userRole = user.roles[0]
    router.push(`/${userRole}/dashboard`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          Payment {status === "pending" ? "Processing" : status === "success" ? "Successful" : "Failed"}
        </CardTitle>
        <CardDescription className="text-center">
          {status === "pending"
            ? "Your payment is being processed"
            : status === "success"
              ? "Your appointment has been booked"
              : "There was an issue with your payment"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {loading ? (
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        ) : status === "success" ? (
          <CheckCircle className="h-16 w-16 text-green-500" />
        ) : status === "error" ? (
          <XCircle className="h-16 w-16 text-red-500" />
        ) : (
          <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
        )}
        <p className="mt-4 text-center">
          {status === "success"
            ? "Thank you for your payment. Your appointment has been confirmed."
            : status === "pending"
              ? "Your payment is being processed. We'll update you once it's complete."
              : "We couldn't process your payment. Please try again or contact support."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {status === "success" && (
          <Button onClick={handleViewAppointment} className="w-full">
            View Appointment
          </Button>
        )}
        <Button onClick={handleGoToDashboard} variant={status === "success" ? "outline" : "default"} className="w-full">
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  )
}
