"use client"

import AppointmentView from "@/components/shared/appointment-view"

export default function TutorAppointmentsPage() {
  return <AppointmentView userRole="tutor" fetchFromApi={false} />
}
