"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { getUserById } from "@/lib/api/users"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, X, CreditCard, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import type { Student, Tutor, Parent, ApiResponse } from "@/lib/types"
import { useRouter } from "next/navigation"

interface AppointmentCalendarProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface TutorCache {
  [key: string]: Tutor | null
}

export default function AppointmentCalendar({ onSuccess, onCancel }: AppointmentCalendarProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingTutors, setFetchingTutors] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [notes, setNotes] = useState("")
  const [selectedTutors, setSelectedTutors] = useState<string[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedParents, setSelectedParents] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [tutorCache, setTutorCache] = useState<TutorCache>({})

  // Use user data from auth context
  const tutors = (user?.tutors || []) as Tutor[]
  const students = (user?.students || []) as Student[]
  const parents = (user?.parents || []) as Parent[]

  const userRoles = user?.roles || []
  const userId = user?.id

  // Determine user's primary role
  const isTutor = userRoles.includes("tutor")
  const isStudent = userRoles.includes("student")
  const isParent = userRoles.includes("parent")

  // Fetch tutor data if not available in the user context
  const fetchTutorData = async (tutorId: string): Promise<Tutor | null> => {
    // Check if we already have this tutor in the cache
    if (tutorCache[tutorId] !== undefined) {
      return tutorCache[tutorId]
    }

    // Check if we already have this tutor in the user context
    const existingTutor = tutors.find((t) => t.id === tutorId)
    if (existingTutor) {
      // Add to cache and return
      setTutorCache((prev) => ({ ...prev, [tutorId]: existingTutor }))
      return existingTutor
    }

    try {
      setFetchingTutors(true)
      const response: ApiResponse<Tutor> = await getUserById(tutorId)

      if (response.error || !response.data) {
        console.error("Error fetching tutor:", response.error)
        setTutorCache((prev) => ({ ...prev, [tutorId]: null }))
        return null
      }

      const tutorData = response.data as Tutor

      // Add to cache
      setTutorCache((prev) => ({ ...prev, [tutorId]: tutorData }))
      return tutorData
    } catch (error) {
      console.error("Error fetching tutor:", error)
      setTutorCache((prev) => ({ ...prev, [tutorId]: null }))
      return null
    } finally {
      setFetchingTutors(false)
    }
  }

  // Fetch tutor data for all selected tutors
  useEffect(() => {
    const fetchMissingTutors = async () => {
      if (selectedTutors.length === 0) return

      setFetchingTutors(true)
      const tutorsToFetch = selectedTutors.filter(
        (id) => !tutors.some((t) => t.id === id) && tutorCache[id] === undefined,
      )

      if (tutorsToFetch.length === 0) {
        setFetchingTutors(false)
        return
      }

      try {
        const fetchPromises = tutorsToFetch.map((id) => fetchTutorData(id))
        await Promise.all(fetchPromises)

        // Recalculate price after fetching tutors
        calculatePrice(selectedTutors, startTime, endTime)
      } catch (error) {
        console.error("Error fetching tutors:", error)
      } finally {
        setFetchingTutors(false)
      }
    }

    fetchMissingTutors()
  }, [selectedTutors])

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

  const getTutorHourlyRate = (tutorId: string): number => {
    // First check the cache
    if (tutorCache[tutorId]) {
      return tutorCache[tutorId]?.hourlyRate || 50
    }

    // Then check the user context
    const tutor = tutors.find((t) => t.id === tutorId)
    if (tutor) {
      return tutor.hourlyRate || 50
    }

    // Default fallback
    return 50
  }

  const calculatePrice = async (tutorIds: string[], start: string, end: string) => {
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

    // If no tutors selected, return null price
    if (tutorIds.length === 0) {
      setPrice(null)
      return
    }

    // Check if we need to fetch any tutor data
    const missingTutors = tutorIds.filter((id) => !tutors.some((t) => t.id === id) && tutorCache[id] === undefined)

    if (missingTutors.length > 0) {
      setFetchingTutors(true)
      try {
        // Fetch missing tutor data
        await Promise.all(missingTutors.map((id) => fetchTutorData(id)))
      } catch (error) {
        console.error("Error fetching tutors for price calculation:", error)
      } finally {
        setFetchingTutors(false)
      }
    }

    // Calculate price based on tutors' hourly rates
    let totalPrice = 0

    tutorIds.forEach((tutorId) => {
      // Get hourly rate from cache, user context, or default
      const hourlyRate = getTutorHourlyRate(tutorId)

      // Calculate price based on duration (convert minutes to hours)
      totalPrice += (hourlyRate * durationMinutes) / 60
    })

    // Round to 2 decimal places for currency
    totalPrice = Math.round(totalPrice * 100) / 100

    // Set minimum price per tutor if calculation results in 0 or very small amount
    if (totalPrice < 5 && tutorIds.length > 0) {
      totalPrice = 5 * tutorIds.length // Minimum $5 per tutor
    }

    setPrice(totalPrice)
  }

  const getTutorName = (id: string) => {
    // First check the cache
    if (tutorCache[id]) {
      const tutor = tutorCache[id]
      return tutor ? `${tutor.firstName} ${tutor.lastName} ($${tutor.hourlyRate || 50}/hr)` : id
    }

    // Then check the user context
    const tutor = tutors.find((t) => t.id === id)
    if (tutor) {
      return `${tutor.firstName} ${tutor.lastName} ($${tutor.hourlyRate || 50}/hr)`
    }

    // If we don't have the data yet, show loading state
    return `${id} (loading...)`
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

    // Validate that we have a valid price
    if (price === null || price <= 0) {
      setValidationError("Unable to calculate a valid price. Please check tutor selection and appointment duration.")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAppointment()) {
      return
    }

    // Recalculate price to ensure it's up-to-date
    await calculatePrice(selectedTutors, startTime, endTime)

    // If price is still null or 0 after calculation, show error
    if (price === null || price <= 0) {
      setValidationError("Unable to calculate price. Please check tutor selection and appointment duration.")
      return
    }

    // Create start and end time Date objects
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    const startDateTime = setHours(setMinutes(selectedDate, startMinute), startHour)
    const endDateTime = setHours(setMinutes(selectedDate, endMinute), endHour)

    setLoading(true)

    try {
      // Automatically include the current user based on their role
      const updatedTutors = [...selectedTutors]
      const updatedStudents = [...selectedStudents]
      const updatedParents = [...selectedParents]

      if (userId) {
        if (isTutor && !updatedTutors.includes(userId)) {
          updatedTutors.push(userId)
        }
        if (isStudent && !updatedStudents.includes(userId)) {
          updatedStudents.push(userId)
        }
        if (isParent && !updatedParents.includes(userId)) {
          updatedParents.push(userId)
        }
      }

      // Set appropriate status based on user role
      // If a tutor creates the appointment, it's "awaiting_payment"
      // If a student/parent creates it, it will be updated after payment
      const initialStatus = isTutor ? "awaiting_payment" : "pending"

      // Create the appointment
      const appointmentResponse = await createAppointment({
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        tutors: updatedTutors,
        students: updatedStudents,
        parents: updatedParents,
        status: initialStatus,
        notes,
        price: price, // Always save the calculated price
      })

      if (appointmentResponse.error) {
        throw new Error(appointmentResponse.error)
      }

      const appointmentId = appointmentResponse.data?.doc?.id

      // If the user is a tutor, just create the appointment without payment
      if (isTutor) {
        toast({
          title: "Success",
          description: "Appointment created successfully. Awaiting payment confirmation from student/parent.",
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/tutor/appointments")
        }
        return
      }

      // For students and parents, proceed with payment flow
      const stripeResponse = await createStripeCheckoutSession({
        appointmentId,
        title,
        price: price,
        tutorIds: updatedTutors,
        parentIds: updatedParents,
        studentIds: updatedStudents,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes,
      })

      if (stripeResponse.error) {
        throw new Error(stripeResponse.error)
      }

      // Redirect to Stripe checkout
      if (stripeResponse.data?.url) {
        window.location.href = stripeResponse.data.url
      } else {
        throw new Error("No checkout URL returned from Stripe")
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
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  required
                />
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
                        {tutor.firstName} {tutor.lastName} {tutor.hourlyRate ? `($${tutor.hourlyRate}/hr)` : "($50/hr)"}
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes here..."
                rows={3}
              />
            </div>

            {fetchingTutors && (
              <div className="flex items-center justify-center p-4 bg-slate-50 rounded-lg border">
                <Loader2 className="h-5 w-5 text-slate-500 animate-spin mr-2" />
                <span>Calculating price based on tutor rates...</span>
              </div>
            )}

            {!fetchingTutors && price !== null && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-slate-500" />
                    <span className="font-medium">Total Price:</span>
                  </div>
                  <span className="text-lg font-bold">${price.toFixed(2)}</span>
                </div>
                {isTutor ? (
                  <p className="text-sm text-slate-500 mt-2">
                    This price will be charged to the student/parent when they confirm the appointment.
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 mt-2">
                    You will be redirected to a secure payment page after submitting.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading || fetchingTutors}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || fetchingTutors || price === null}>
                {loading ? "Processing..." : isTutor ? "Create Appointment" : "Proceed to Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
