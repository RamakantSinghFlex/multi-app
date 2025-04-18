"use client"

import AppointmentView from "@/components/shared/appointment-view"

export default function ParentAppointmentsPage() {
  return <AppointmentView userRole="parent" fetchFromApi={false} />
}
