"use client"

import { AppointmentPaymentStatus } from "@/components/appointment/appointment-payment"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.roles || user.roles.length === 0) {
        // Fallback if no user or roles
        router.push("/")
        return
      }

      const userRole = user.roles[0]
    }
  }, [user, isLoading, router])

  return (
    <div className="container max-w-md mx-auto py-12">
      <AppointmentPaymentStatus />
    </div>
  )
}
