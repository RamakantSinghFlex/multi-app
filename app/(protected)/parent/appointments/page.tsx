"use client"

import { AppointmentView } from "@/components/shared/appointment-view"

export default function ParentAppointmentsPage() {
  return (
    <div className="container py-6">
      <AppointmentView userRole="parent" />
    </div>
  )
}
