"use client"

import { GoogleCalendarView } from "@/components/calendar/google-calendar-view"

export default function TutorAppointmentsPage() {
  return <GoogleCalendarView userRole="tutor" className="p-6" />
}
