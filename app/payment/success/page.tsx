"use client"

import { AppointmentPaymentStatus } from "@/components/appointment/appointment-payment"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded) {
      if (!user || !user.roles || user.roles.length === 0) {
        // Fallback if no user or roles
        router.push("/")
        return
      }

      const userRole = user.roles[0]
      router.push(`/${userRole}`)
    }
  }, [user, isLoaded, router])

  return (
    <div className="container max-w-md mx-auto py-12">
      <AppointmentPaymentStatus />
    </div>
  )
}
