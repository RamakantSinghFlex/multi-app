"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Eye, EyeOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createStudent } from "@/lib/api/students"
import { useToast } from "@/hooks/use-toast"
import { ErrorModal, parseApiError, type ApiError } from "@/components/ui/error-modal"
import { generateSecurePassword } from "@/lib/utils/password-generator"
import { getMe } from "@/lib/api" // Import getMe directly instead of using useAuth

export default function NewStudentPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Use state to store the user ID
  const [userId, setUserId] = useState<string | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getMe()
        const userData = data
        if (userData && userData.id) {
          setUserId(userData.id)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gradeLevel: "",
    school: "",
    notes: "",
    tenantName: process.env.TENANT_NAME, // Add default tenant name
    roles: ["student"],
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneratePassword = () => {
    const password = generateSecurePassword(12)
    setFormData((prev) => ({ ...prev, password }))
  }

  // Update the handleSubmit function to use the router.refresh() method after successful creation
  // This will ensure the student list is updated when the user is redirected

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setApiErrors(null)

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError("Please fill in all required fields")
        setIsLoading(false)
        return
      }

      // Create student with the userId from state
      const studentData = {
        ...formData,
        parents: userId ? [userId] : [],
      }

      const response = await createStudent(studentData)

      if (response.error) {
        try {
          // Try to parse the error as JSON if it's a string
          const parsedErrors =
            typeof response.error === "string" && response.error.startsWith("{")
              ? JSON.parse(response.error)
              : response.error

          setApiErrors(parseApiError(parsedErrors))
          setShowErrorModal(true)
        } catch (e) {
          setError(response.error)
        }
        setIsLoading(false)
        return
      }

      // Success - handle the specific response format
      let successMessage = "Student created successfully"
      let createdStudent = null

      // Check if the response has the expected format with doc property
      if (response.data && "doc" in response.data) {
        createdStudent = response.data.doc
        successMessage = response.data.message || successMessage

        // Store the newly created student in localStorage for immediate access
        if (createdStudent && createdStudent.id) {
          try {
            // Get existing students from localStorage or initialize empty array
            const existingStudentsJson = localStorage.getItem("recentlyCreatedStudents") || "[]"
            const existingStudents = JSON.parse(existingStudentsJson)

            // Add the new student and keep only the 5 most recent
            existingStudents.unshift(createdStudent)
            const recentStudents = existingStudents.slice(0, 5)

            // Save back to localStorage
            localStorage.setItem("recentlyCreatedStudents", JSON.stringify(recentStudents))
          } catch (err) {
            console.error("Error storing student in localStorage:", err)
          }
        }
      }

      // Show success message
      toast({
        title: "Success",
        description: successMessage,
      })

      // Refresh the router cache before redirecting
      router.refresh()

      // Redirect to students list
      router.push("/parent/students")
    } catch (err) {
      console.error("Error creating student:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Add New Student</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Enter the details for the new student</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
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
                  value={formData.lastName}
                  onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="pr-20"
                />
                <div className="absolute inset-y-0 right-0 flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-full px-2 text-xs"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-full px-2 text-xs"
                    onClick={handleGeneratePassword}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Select
                  value={formData.gradeLevel}
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
                <Input id="school" name="school" value={formData.school} onChange={handleChange} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={isLoading}
                rows={4}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || userLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : userLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Create Student"
            )}
          </Button>
        </CardFooter>
      </Card>

      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={apiErrors}
        title="Error Creating Student"
        description="Please correct the following errors and try again."
      />
    </div>
  )
}
