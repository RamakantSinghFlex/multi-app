"use client"
import { useRouter } from "next/navigation"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"

export default function NewAppointmentPage() {
  const router = useRouter()

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
