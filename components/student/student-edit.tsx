"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorModal, parseApiError, type ApiError } from "@/components/ui/error-modal"
import type { User } from "@/lib/types"
import { updateUser } from "@/lib/api/users"

interface StudentEditProps {
  studentId: string
  students: User[]
  backPath: string
}

export function StudentEdit({ studentId, students, backPath }: StudentEditProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Student form state
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gradeLevel: "",
    school: "",
    notes: "",
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = () => {
      setIsFetching(true)

      // Find the student in the provided students array
      const foundStudent = students.find((s) => s.id === studentId)

      if (foundStudent) {
        setStudentData({
          firstName: foundStudent.firstName || "",
          lastName: foundStudent.lastName || "",
          email: foundStudent.email || "",
          phone: foundStudent.phone || "",
          gradeLevel: foundStudent.gradeLevel || "",
          school: foundStudent.school || "",
          notes: foundStudent.notes || "",
        })
      } else {
        toast({
          title: "Error",
          description: "Student not found",
          variant: "destructive",
        })
      }

      setIsFetching(false)
    }

    fetchStudentData()
  }, [studentId, students, toast])

  // Handle student form changes
  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStudentData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setStudentData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!studentData.firstName || !studentData.lastName || !studentData.email) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)
    setApiErrors(null)

    try {
      const response = await updateUser(studentId, studentData)

      if (response.error) {
        handleApiError(response.error, "Error updating student")
        return
      }

      // Show success message
      toast({
        title: "Success",
        description: "Student updated successfully",
      })

      // Refresh the router cache before redirecting
      router.refresh()

      // Redirect to student view
      router.push(`${backPath.replace(/\/$/, "")}/${studentId}`)
    } catch (err) {
      console.error("Error updating student:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to handle API errors
  const handleApiError = (error: any, defaultMessage: string) => {
    try {
      // Try to parse the error as JSON if it's a string
      const parsedErrors = typeof error === "string" && error.startsWith("{") ? JSON.parse(error) : error

      setApiErrors(parseApiError(parsedErrors))
      setShowErrorModal(true)
    } catch (e) {
      setError(typeof error === "string" ? error : defaultMessage)
    }
    setIsLoading(false)
  }

  if (isFetching) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Student</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Update the student's details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={studentData.firstName}
                    onChange={handleStudentChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={studentData.lastName}
                    onChange={handleStudentChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={studentData.email}
                  onChange={handleStudentChange}
                  disabled={true}
                  className="bg-[#f4f4f4]"
                  required
                />
                <p className="text-xs text-[#858585]">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={studentData.phone}
                  onChange={handleStudentChange}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select
                    value={studentData.gradeLevel}
                    onValueChange={(value) => handleSelectChange("gradeLevel", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="gradeLevel">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">Elementary School</SelectItem>
                      <SelectItem value="middle">Middle School</SelectItem>
                      <SelectItem value="high">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    name="school"
                    value={studentData.school}
                    onChange={handleStudentChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={studentData.notes}
                  onChange={handleStudentChange}
                  disabled={isLoading}
                  rows={4}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={apiErrors}
        title="Error Updating Student"
        description="Please correct the following errors and try again."
      />
    </div>
  )
}
