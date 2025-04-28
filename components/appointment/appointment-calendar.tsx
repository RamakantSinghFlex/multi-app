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
import { format, setHours, setMinutes, isPast, isToday, differenceInMinutes } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { createAppointment } from "@/lib/api/appointments"
import { createStripeCheckoutSession } from "@/lib/api/stripe"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, X, CreditCard, ChevronDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import type { Student, Tutor, Parent } from "@/lib/types"
import { useRouter } from "next/navigation"

interface AppointmentCalendarProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AppointmentCalendar({ onSuccess, onCancel }: AppointmentCalendarProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
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
  const [price, setPrice] = useState<number | null>(null)

  // Use user data from auth context
  const tutors = (user?.tutors || []) as Tutor[]
  const students = (user?.students || []) as Student[]
  const parents = (user?.parents || []) as Parent[]

  const userRoles = user?.roles || []
  const userId = user?.id

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddTutor = (tutorId: string) => {
    if (!selectedTutors.includes(tutorId)) {
      setSelectedTutors([...selectedTutors, tutorId])
      calculatePrice([...selectedTutors, tutorId], startTime, endTime)
    }
  }

  const handleRemoveTutor = (tutorId: string) => {
    const updatedTutors = selectedTutors.filter((id) => id !== tutorId)
    setSelectedTutors(updatedTutors)
    calculatePrice(updatedTutors, startTime, endTime)
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

  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    calculatePrice(selectedTutors, value, endTime)
  }

  const handleEndTimeChange = (value: string) => {
    setEndTime(value)
    calculatePrice(selectedTutors, startTime, value)
  }

  const calculatePrice = (tutorIds: string[], start: string, end: string) => {
    // Parse times
    const [startHour, startMinute] = start.split(":").map(Number)
    const [endHour, endMinute] = end.split(":").map(Number)

    const startDateTime = new Date(selectedDate)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(selectedDate)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    // Calculate duration in minutes
    const durationMinutes = differenceInMinutes(endDateTime, startDateTime)

    if (durationMinutes <= 0) {
      setPrice(null)
      return
    }

    // Calculate price based on tutors' hourly rates
    let totalPrice = 0
    tutorIds.forEach((tutorId) => {
      const tutor = tutors.find((t) => t.id === tutorId)
      const hourlyRate = tutor?.hourlyRate || 50 // Default rate if not specified
      totalPrice += (hourlyRate * durationMinutes) / 60
    })

    setPrice(totalPrice)
  }

  const getTutorName = (id: string) => {
    const tutor = tutors.find((t) => t.id === id)
    return tutor ? `${tutor.firstName} ${tutor.lastName} (${tutor.hourlyRate || 50}/hr)` : id
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

    setLoading(true)

    try {
      // Parse times
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)

      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      const endDateTime = new Date(selectedDate)
      endDateTime.setHours(endHour, endMinute, 0, 0)

      // Create the appointment
      const appointmentData = {
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes,
        status,
        amount: price as number,
        tutors: selectedTutors,
        students: selectedStudents,
        parents: selectedParents.length > 0 ? selectedParents : user?.id ? [user.id] : [],
      }

      const response = await createAppointment(appointmentData)

      if (response.error) {
        throw new Error(response.error)
      }

      const appointmentId = response.data?.id

      if (!appointmentId) {
        throw new Error("Failed to create appointment: No ID returned")
      }

      // If the current user is a parent, redirect to payment
      if (userRoles.includes("parent") && price !== null) {
        // Using parameters that match the expected API interface
        const stripeResponse = await createStripeCheckoutSession({
          appointmentId,
          price: price, 
          title: title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes,
          tutorIds: selectedTutors,
          parentIds: selectedParents.length > 0 ? selectedParents : user?.id ? [user.id] : undefined,
          studentIds: selectedStudents
        })

        if (stripeResponse.error) {
          throw new Error(stripeResponse.error)
        }

        // Redirect to Stripe Checkout
        if (stripeResponse.data?.url) {
          router.push(stripeResponse.data.url)
        } else {
          throw new Error("No payment URL received")
        }
      } else {
        // For tutors or admins, just show success message
        toast({
          title: "Success",
          description: "Appointment created successfully",
        })

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[80vh]">
      {/* Left Column - Calendar */}
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

      {/* Right Column - Form */}
      <Card className="md:col-span-2 flex flex-col max-h-[80vh]">
        {/* Top validation error if any */}
        {validationError && (
          <Alert variant="destructive" className="m-4 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Scrollable form area */}
        <div className="overflow-y-auto flex-grow p-4" style={{ overflowY: 'auto', scrollbarWidth: 'thin' }}>
          <form id="appointment-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="mb-5">
              <Label htmlFor="title" className="text-sm font-semibold mb-1.5 block">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Math Tutoring Session"
                required
                className="w-full"
              />
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <Label htmlFor="startTime" className="text-sm font-semibold mb-1.5 block">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-sm font-semibold mb-1.5 block">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Tutors Section */}
            <div className="mb-5 p-4 border border-slate-200 rounded-md">
              <Label htmlFor="tutors" className="text-sm font-semibold mb-2 block">Tutors</Label>
              <Select onValueChange={handleAddTutor}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tutors" />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.firstName} {tutor.lastName} {tutor.hourlyRate ? `($${tutor.hourlyRate}/hr)` : "($50/hr)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTutors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTutors.map((tutorId) => (
                    <Badge key={tutorId} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                      {getTutorName(tutorId)}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTutor(tutorId)}
                        className="text-red-500 hover:text-red-700 rounded-full ml-1 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Students Section */}
            <div className="mb-5 p-4 border border-slate-200 rounded-md">
              <Label htmlFor="students" className="text-sm font-semibold mb-2 block">Students</Label>
              <Select onValueChange={handleAddStudent}>
                <SelectTrigger className="w-full">
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
                    <Badge key={studentId} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                      {getStudentName(studentId)}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveStudent(studentId)}
                        className="text-red-500 hover:text-red-700 rounded-full ml-1 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Parents Section */}
            {parents.length > 0 && (
              <div className="mb-5 p-4 border border-slate-200 rounded-md">
                <Label htmlFor="parents" className="text-sm font-semibold mb-2 block">Parents</Label>
                <Select onValueChange={handleAddParent}>
                  <SelectTrigger className="w-full">
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
                      <Badge key={parentId} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
                        {getParentName(parentId)}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveParent(parentId)}
                          className="text-red-500 hover:text-red-700 rounded-full ml-1 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes Section */}
            <div className="mb-5 p-4 border border-slate-200 rounded-md">
              <Label htmlFor="notes" className="text-sm font-semibold mb-2 block">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes here..."
                rows={3}
                className="w-full"
              />
            </div>

            {/* Price Display */}
            {price !== null && (
              <div className="mb-5 bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Total Price:</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">${price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  You will be redirected to a secure payment page after submitting.
                </p>
              </div>
            )}

            {/* Scroll indicator */}
            <div className="absolute bottom-24 right-6 animate-bounce bg-slate-100 rounded-full p-1 shadow-md hidden md:block">
              <ChevronDown className="h-5 w-5 text-slate-500" />
            </div>
          </form>
        </div>

        {/* Fixed footer with action buttons */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg mt-auto">
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="appointment-form" 
              disabled={loading || price === null} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              {loading ? "Processing..." : userRoles.includes("tutor") ? "Create Appointment" : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
