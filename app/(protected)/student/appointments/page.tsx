"use client"

import AppointmentView from "@/components/shared/appointment-view"

export default function StudentAppointmentsPage() {
  return <AppointmentView userRole="student" fetchFromApi={true} className="p-6" />
}
