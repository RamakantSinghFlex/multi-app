"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarView } from "@/components/ui/calendar-view"
import { format, setHours, setMinutes, isPast, isToday } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { createAppointment } from "@/lib/api/appointments"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import type { Student, Tutor, Parent } from "@/lib/types"

interface AppointmentCalendarProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AppointmentCalendar({ onSuccess, onCancel }: AppointmentCalendarProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("pending")
  const [selectedTutors, setSelectedTutors] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedParents, setSelectedParents] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  // Use user data from auth context
  const tutors = (user?.tutors || []) as Tutor[]
  const students = (user?.students || []) as Student[]
  const parents = (user?.parents || []) as Parent[]

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddTutor = (tutorId: string) => {
    if (!selectedTutors.includes(tutorId)) {
      setSelectedTutors([...selectedTutors, tutorId])
    }
  }

  const handleRemoveTutor = (tutorId: string) => {
    setSelectedTutors(selectedTutors.filter((id) => id !== tutorId))
  }

  const handleAddStudent = (studentId: string) => {
    if (!selectedStudents.includes(studentId)) {
      setSelectedStudents([...selectedStudents, studentId])
    }
  }

  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
  }

  const handleAddParent = (parentId: string) => {
    if (!selectedParents.includes(parentId)) {
      setSelectedParents([...selectedParents, parentId])
    }
  }

  const handleRemoveParent = (parentId: string) => {
    setSelectedParents(selectedParents.filter((id) => id !== parentId))
  }

  const getTutorName = (id: string) => {
    const tutor = tutors.find((t) => t.id === id)
    return tutor ? `${tutor.firstName} ${tutor.lastName}` : id
  }

  const getStudentName = (id: string) => {
    const student = students.find((studentItem) => studentItem.id === id)
    return student ? `${student.firstName} ${student.lastName}` : id
  }

  const getParentName = (id: string) => {
    const parent = parents.find((p) => p.id === id)
    return parent ? `${parent.firstName} ${parent.lastName}` : id
  }

  const validateAppointment = () => {
    // Clear previous validation errors
    setValidationError(null)

    if (!title) {
      setValidationError("Please enter a title for the appointment")
      return false
    }

    if (selectedTutors.length === 0) {
      setValidationError("Please select at least one tutor")
      return false
    }

    if (selectedStudents.length === 0) {
      setValidationError("Please select at least one student")
      return false
    }

    // Create start and end time Date objects
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startDateTime = new Date(selectedDate)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(selectedDate)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    // Check if the appointment is in the past
    const now = new Date()
    if (isPast(startDateTime)) {
      setValidationError("Appointment cannot be scheduled in the past")
      return false
    }

    // Check if the appointment is today and the time is in the past
    if (isToday(startDateTime) && startDateTime < now) {
      setValidationError("Appointment cannot be scheduled for a time in the past")
      return false
    }

    // Check if end time is after start time
    if (endDateTime <= startDateTime) {
      setValidationError("End time must be after start time")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAppointment()) {
      return
    }

    // Create start and end time Date objects
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startDateTime = setHours(setMinutes(selectedDate, startMinute), startHour)
    const endDateTime = setHours(setMinutes(selectedDate, endMinute), endHour)

    setLoading(true)

    try {
      const response = await createAppointment({
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        tutors: selectedTutors,
        students: selectedStudents,
        parents: selectedParents,
        status,
        notes,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Select Date</h3>
          <CalendarView
            initialMonth={selectedDate}
            onDateSelect={handleDateSelect}
            disablePastDates={true} // Disable past dates
          />
          <div className="mt-4 text-center">
            <p className="text-sm font-medium">Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-6">
          {validationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Math Tutoring Session"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
            </div>

            {tutors.length > 0 && (
              <div>
                <Label htmlFor="tutors">Tutors</Label>
                <Select onValueChange={handleAddTutor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tutors" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.firstName} {tutor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTutors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTutors.map((tutorId) => (
                      <Badge key={tutorId} variant="secondary" className="flex items-center gap-1">
                        {getTutorName(tutorId)}
                        <button type="button" onClick={() => handleRemoveTutor(tutorId)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {students.length > 0 && (
              <div>
                <Label htmlFor="students">Students</Label>
                <Select onValueChange={handleAddStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select students" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStudents.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedStudents.map((studentId) => (
                      <Badge key={studentId} variant="secondary" className="flex items-center gap-1">
                        {getStudentName(studentId)}
                        <button type="button" onClick={() => handleRemoveStudent(studentId)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {parents.length > 0 && (
              <div>
                <Label htmlFor="parents">Parents</Label>
                <Select onValueChange={handleAddParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parents" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedParents.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedParents.map((parentId) => (
                      <Badge key={parentId} variant="secondary" className="flex items-center gap-1">
                        {getParentName(parentId)}
                        <button type="button" onClick={() => handleRemoveParent(parentId)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="status">Appointment Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes here..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
