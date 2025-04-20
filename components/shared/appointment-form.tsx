"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { createAppointment, updateAppointment } from "@/lib/api/appointments"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { ParticipantSelector } from "@/components/shared/participant-selector"
import type { Student, Tutor, Parent, Appointment } from "@/lib/types"

interface AppointmentFormProps {
  initialData?: Partial<Appointment>
  students?: Student[]
  tutors?: Tutor[]
  parents?: Parent[]
  onSuccess?: () => void
  onCancel?: () => void
  mode?: "create" | "edit"
}

export function AppointmentForm({
  initialData,
  students = [],
  tutors = [],
  parents = [],
  onSuccess,
  onCancel,
  mode = "create",
}: AppointmentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Initialize form state from initialData or defaults
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    startTime: initialData?.startTime
      ? format(parseISO(initialData.startTime), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'09:00"),
    endTime: initialData?.endTime
      ? format(parseISO(initialData.endTime), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'10:00"),
    notes: initialData?.notes || "",
    status: initialData?.status || "pending",
    selectedTutors: (initialData?.tutors || []).map((tutor) => (typeof tutor === "string" ? tutor : tutor.id)),
    selectedStudents: (initialData?.students || []).map((student) =>
      typeof student === "string" ? student : student.id,
    ),
    selectedParents: (initialData?.parents || []).map((parent) => (typeof parent === "string" ? parent : parent.id)),
  })

  const [validationError, setValidationError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTutor = (tutorId: string) => {
    if (!formData.selectedTutors.includes(tutorId)) {
      setFormData((prev) => ({
        ...prev,
        selectedTutors: [...prev.selectedTutors, tutorId],
      }))
    }
  }

  const handleRemoveTutor = (tutorId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTutors: prev.selectedTutors.filter((id) => id !== tutorId),
    }))
  }

  const handleAddStudent = (studentId: string) => {
    if (!formData.selectedStudents.includes(studentId)) {
      setFormData((prev) => ({
        ...prev,
        selectedStudents: [...prev.selectedStudents, studentId],
      }))
    }
  }

  const handleRemoveStudent = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedStudents: prev.selectedStudents.filter((id) => id !== studentId),
    }))
  }

  const handleAddParent = (parentId: string) => {
    if (!formData.selectedParents.includes(parentId)) {
      setFormData((prev) => ({
        ...prev,
        selectedParents: [...prev.selectedParents, parentId],
      }))
    }
  }

  const handleRemoveParent = (parentId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedParents: prev.selectedParents.filter((id) => id !== parentId),
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.title) {
      setValidationError("Title is required")
      return false
    }

    if (!formData.startTime || !formData.endTime) {
      setValidationError("Start and end times are required")
      return false
    }

    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setValidationError("Invalid date format")
      return false
    }

    if (start >= end) {
      setValidationError("End time must be after start time")
      return false
    }

    if (formData.selectedTutors.length === 0 && formData.selectedStudents.length === 0) {
      setValidationError("At least one tutor or student must be selected")
      return false
    }

    setValidationError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const appointmentData = {
        id: initialData?.id,
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
        status: formData.status,
        tutors: formData.selectedTutors,
        students: formData.selectedStudents,
        parents: formData.selectedParents,
      }

      let response
      if (mode === "create") {
        response = await createAppointment(appointmentData)
      } else {
        response = await updateAppointment(appointmentData)
      }

      if (response.error) {
        throw new Error(response.error)
      }

      toast({
        title: "Success",
        description: mode === "create" ? "Appointment created successfully" : "Appointment updated successfully",
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving appointment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save appointment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create" : "Edit"} Appointment</CardTitle>
      </CardHeader>
      <CardContent>
        {validationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Math Tutoring Session"
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
              disabled={loading}
            >
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

          {/* Use the shared ParticipantSelector component */}
          {tutors.length > 0 && (
            <ParticipantSelector
              label="Tutors"
              participantType="tutor"
              selectedParticipants={formData.selectedTutors}
              availableParticipants={tutors}
              onAdd={handleAddTutor}
              onRemove={handleRemoveTutor}
              disabled={loading}
            />
          )}

          {students.length > 0 && (
            <ParticipantSelector
              label="Students"
              participantType="student"
              selectedParticipants={formData.selectedStudents}
              availableParticipants={students}
              onAdd={handleAddStudent}
              onRemove={handleRemoveStudent}
              disabled={loading}
            />
          )}

          {parents.length > 0 && (
            <ParticipantSelector
              label="Parents"
              participantType="parent"
              selectedParticipants={formData.selectedParents}
              availableParticipants={parents}
              onAdd={handleAddParent}
              onRemove={handleRemoveParent}
              disabled={loading}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes here..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Appointment"
              ) : (
                "Update Appointment"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
