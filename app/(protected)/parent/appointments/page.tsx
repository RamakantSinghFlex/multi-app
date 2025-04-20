"use client"

import { GoogleCalendarView } from "@/components/calendar/google-calendar-view"

export default function ParentAppointmentsPage() {
  return <GoogleCalendarView userRole="parent" className="p-6" />
}
