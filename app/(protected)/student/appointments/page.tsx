"use client"

import { GoogleCalendarView } from "@/components/calendar/google-calendar-view"

export default function StudentAppointmentsPage() {
  return <GoogleCalendarView userRole="student" className="p-6" />
}
