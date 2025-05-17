"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"
import { useAuth } from "@/lib/auth-context"

export default function NewAppointmentPage() {
  const router = useRouter()
  const { refreshUserData } = useAuth()

  // Refresh user data when the component mounts
  useEffect(() => {
    refreshUserData()
  }, [])

  const handleCancel = () => {
    router.back()
  }

  const handleSuccess = () => {
    // This will be handled by the Stripe redirect
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Book a New Appointment</h1>
      <AppointmentCalendar onCancel={handleCancel} onSuccess={handleSuccess} />
    </div>
  )
}
