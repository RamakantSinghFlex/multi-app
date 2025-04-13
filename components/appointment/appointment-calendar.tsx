"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, addMinutes, isBefore, addDays } from "date-fns"
import { ChevronLeft, Clock, Video, CalendarIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface TimeSlot {
  startTime: Date
  endTime: Date
  formatted: string
}

interface AppointmentCalendarProps {
  duration?: number // in minutes
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AppointmentCalendar({ duration = 30, onSuccess, onCancel }: AppointmentCalendarProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  // States for the appointment booking flow
  const [step, setStep] = useState<"date" | "time" | "details">("date")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [title, setTitle] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // States for API data
  const [students, setStudents] = useState<any[]>([])
  const [parents, setParents] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [selectedParent, setSelectedParent] = useState<string>("")
  const [selectedTutor, setSelectedTutor] = useState<string>("")

  // Generate time slots for the selected date
  const generateTimeSlots = (selectedDate: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []

    // Start at 7:00 AM
    const startTime = new Date(selectedDate)
    startTime.setHours(7, 0, 0, 0)

    // End at 7:00 PM
    const endTime = new Date(selectedDate)
    endTime.setHours(19, 0, 0, 0)

    let currentTime = new Date(startTime)

    while (isBefore(currentTime, endTime)) {
      const slotEndTime = addMinutes(currentTime, duration)

      slots.push({
        startTime: new Date(currentTime),
        endTime: slotEndTime,
        formatted: format(currentTime, "h:mma"),
      })

      // Add slots every 30 minutes
      currentTime = addMinutes(currentTime, 30)
    }

    return slots
  }

  const timeSlots = date ? generateTimeSlots(date) : []

  // Fetch students, parents, and tutors data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch this data from an API
        // For now, we'll use mock data

        // Mock students data
        setStudents([
          { id: "student1", firstName: "John", lastName: "Doe", email: "john@example.com" },
          { id: "student2", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
        ])

        // Mock parents data
        setParents([
          { id: "parent1", firstName: "Robert", lastName: "Doe", email: "robert@example.com" },
          { id: "parent2", firstName: "Mary", lastName: "Smith", email: "mary@example.com" },
        ])

        // Mock tutors data
        setTutors([
          { id: "tutor1", firstName: "Alice", lastName: "Johnson", email: "alice@example.com" },
          { id: "tutor2", firstName: "Bob", lastName: "Brown", email: "bob@example.com" },
        ])

        // If current user is a tutor, pre-select them
        if (user && user.role === "tutor") {
          setSelectedTutor(user.id)
        }
      } catch (error) {
        console.error("Error preparing data:", error)
        toast({
          title: "Error",
          description: "Failed to load necessary data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setStep("time")
    }
  }

  const handleSelectTime = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setStep("details")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !selectedTimeSlot || !selectedStudent || !selectedTutor) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Format the appointment data
      const appointmentData = {
        id: `appointment-${Date.now()}`, // Generate a temporary ID
        title: title || `${duration} Minute Appointment`,
        date: date.toISOString(),
        startTime: selectedTimeSlot.startTime.toISOString(),
        endTime: selectedTimeSlot.endTime.toISOString(),
        tutor: selectedTutor,
        student: selectedStudent,
        parent: selectedParent,
        status: "pending",
        notes: notes,
      }

      // In a real app, you would make an API call to create the appointment
      // For now, we'll just simulate a successful creation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      })

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Reset the form
      setDate(new Date())
      setSelectedTimeSlot(null)
      setTitle("")
      setNotes("")
      setStep("date")
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === "time") {
      setStep("date")
    } else if (step === "details") {
      setStep("time")
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center">
          {step !== "date" && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle>
              {step === "date" && "Select a Date"}
              {step === "time" && "Select a Time"}
              {step === "details" && "Enter Appointment Details"}
            </CardTitle>
            <CardDescription>
              {step === "date" && "Choose a date for your appointment"}
              {step === "time" && format(date!, "EEEE, MMMM d, yyyy")}
              {step === "details" && `${format(date!, "EEEE, MMMM d, yyyy")} at ${selectedTimeSlot?.formatted}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {step === "date" && (
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelectDate}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
              className="rounded-md border"
            />
          </div>
        )}

        {step === "time" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {timeSlots.map((slot, index) => (
              <Button key={index} variant="outline" className="h-12" onClick={() => handleSelectTime(slot)}>
                {slot.formatted}
              </Button>
            ))}
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Appointment Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${duration} Minute Appointment`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tutor">Tutor</Label>
                <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                  <SelectTrigger id="tutor">
                    <SelectValue placeholder="Select a tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.firstName} {tutor.lastName || ""} ({tutor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName || ""} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Parent</Label>
                <Select value={selectedParent} onValueChange={setSelectedParent}>
                  <SelectTrigger id="parent">
                    <SelectValue placeholder="Select a parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName || ""} ({parent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information about this appointment"
                rows={4}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Video className="h-4 w-4" />
                <span>Web conferencing details provided upon confirmation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(date!, "EEEE, MMMM d, yyyy")} at {selectedTimeSlot?.formatted}
                </span>
              </div>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>

        {step === "details" && (
          <Button type="submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Appointment"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
