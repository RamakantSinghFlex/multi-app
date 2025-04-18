"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createUser } from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"
import { ErrorModal, parseApiError, type ApiError } from "@/components/ui/error-modal"
import { getMe } from "@/lib/api" // Import getMe directly instead of using useAuth
import type { User } from "@/lib/types"
import { TENANT_NAME } from "@/lib/config"
// Import the shared PasswordInput component
import { PasswordInput } from "@/components/ui/password-input"

// Creation mode types
type CreationMode = "student" | "student-parent" | "student-tutor" | "student-parent-tutor"

// Define the tab types for better type safety
type TabType = "student" | "parent" | "tutor"

export default function NewStudentPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Use state to store the user ID and role
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Creation mode state
  const [creationMode, setCreationMode] = useState<CreationMode>("student")

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getMe()
        const userData = data
        if (userData && userData.id) {
          setUserId(userData.id)
          setUserRole(userData.role || (userData.roles && userData.roles.length > 0 ? userData.roles[0] : null))
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Student form state
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gradeLevel: "",
    school: "",
    notes: "",
    tenantName: TENANT_NAME, // Add default tenant name
    roles: ["student"],
  })

  // Parent form state
  const [parentData, setParentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    tenantName: TENANT_NAME,
    roles: ["parent"],
  })

  // Tutor form state
  const [tutorData, setTutorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    tenantName: TENANT_NAME,
    roles: ["tutor"],
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("student")
  const [creationProgress, setCreationProgress] = useState("")

  // Get available tabs based on creation mode
  const getAvailableTabs = useCallback((): TabType[] => {
    switch (creationMode) {
      case "student":
        return ["student"]
      case "student-parent":
        return ["student", "parent"]
      case "student-tutor":
        return ["student", "tutor"]
      case "student-parent-tutor":
        return ["student", "parent", "tutor"]
      default:
        return ["student"]
    }
  }, [creationMode])

  // Update active tab when creation mode changes
  useEffect(() => {
    const availableTabs = getAvailableTabs()
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0])
    }
  }, [creationMode, activeTab, getAvailableTabs])

  // Handle student form changes
  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStudentData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle parent form changes
  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setParentData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle tutor form changes
  const handleTutorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTutorData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (formType: "student" | "parent" | "tutor", name: string, value: string) => {
    if (formType === "student") {
      setStudentData((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "parent") {
      setParentData((prev) => ({ ...prev, [name]: value }))
    } else if (formType === "tutor") {
      setTutorData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle password changes
  const handlePasswordChange = (formType: "student" | "parent" | "tutor", value: string) => {
    if (formType === "student") {
      setStudentData((prev) => ({ ...prev, password: value }))
    } else if (formType === "parent") {
      setParentData((prev) => ({ ...prev, password: value }))
    } else if (formType === "tutor") {
      setTutorData((prev) => ({ ...prev, password: value }))
    }
  }

  // Handle creation mode change
  const handleCreationModeChange = (mode: CreationMode) => {
    setCreationMode(mode)

    // Reset any errors when changing mode
    setError(null)

    // Get the available tabs for the new mode
    const availableTabs = getAvailableTabs()

    // If the current active tab is not available in the new mode, switch to the first available tab
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0])
    }
  }

  // Navigate to the next tab
  const handleNextTab = () => {
    const availableTabs = getAvailableTabs()
    const currentIndex = availableTabs.indexOf(activeTab)

    if (currentIndex < availableTabs.length - 1) {
      setActiveTab(availableTabs[currentIndex + 1])
    }
  }

  // Validate the current tab
  const validateCurrentTab = (): boolean => {
    if (activeTab === "student") {\
      if (!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.passwor  {
      if (!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.password) {
        setError("Please fill in all required student fields")
        return false
      }
    } else if (activeTab === "parent") {
      if (!parentData.firstName || !parentData.lastName || !parentData.email || !parentData.password) {
        setError("Please fill in all required parent fields")
        return false
      }
    } else if (activeTab === "tutor") {
      if (!tutorData.firstName || !tutorData.lastName || !tutorData.email || !tutorData.password) {
        setError("Please fill in all required tutor fields")
        return false
      }
    }
    return true
  }

  // Handle next button click
  const handleNextButtonClick = () => {
    if (validateCurrentTab()) {
      setError(null)
      handleNextTab()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate the current tab first
    if (!validateCurrentTab()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setApiErrors(null)
    setCreationProgress("")

    try {
      // Step 1: Create Student
      setCreationProgress("Creating student...")
      const studentPayload = {
        ...studentData,
      }

      if (userId && userRole === "parent") {
        studentPayload.parents = [userId]
      }

      const studentResponse = await createUser(studentPayload)

      if (studentResponse.error) {
        handleApiError(studentResponse.error, "Error creating student")
        return
      }

      const createdStudent = studentResponse.data
      if (!createdStudent || !createdStudent.id) {
        setError("Failed to create student: No student ID returned")
        setIsLoading(false)
        return
      }

      // Store the newly created student in localStorage for immediate access
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

      // Step 2: Create Parent if needed
      let createdParent: User | null = null
      if (creationMode === "student-parent" || creationMode === "student-parent-tutor") {
        setCreationProgress("Creating parent...")

        const parentPayload = {
          ...parentData,
          students: [createdStudent.id], // Link to the created student
          tutors: [userId],
        }

        const parentResponse = await createUser(parentPayload)

        if (parentResponse.error) {
          handleApiError(parentResponse.error, "Error creating parent")
          return
        }

        createdParent = parentResponse.data
      }

      // Step 3: Create Tutor if needed
      let createdTutor: User | null = null
      if (creationMode === "student-tutor" || creationMode === "student-parent-tutor") {
        setCreationProgress("Creating tutor...")

        const tutorPayload = {
          ...tutorData,
          students: [createdStudent.id], // Link to the created student
          parents: [createdParent?.id], // Link to the created student
          tutors: [userId], // Link to the created student
        }

        const tutorResponse = await createUser(tutorPayload)

        if (tutorResponse.error) {
          handleApiError(tutorResponse.error, "Error creating tutor")
          return
        }

        createdTutor = tutorResponse.data
      }

      // Success
      let successMessage = "Student created successfully"

      // Add details about parent/tutor creation if applicable
      if (creationMode === "student-parent" && createdParent) {
        successMessage = "Student and parent created successfully"
      } else if (creationMode === "student-tutor" && createdTutor) {
        successMessage = "Student and tutor created successfully"
      } else if (creationMode === "student-parent-tutor" && createdParent && createdTutor) {
        successMessage = "Student, parent, and tutor created successfully"
      }

      // Show success message
      toast({
        title: "Success",
        description: successMessage,
      })

      // Reset all form states
      setStudentData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        gradeLevel: "",
        school: "",
        notes: "",
        tenantName: TENANT_NAME,
        roles: ["student"],
      })

      setTutorData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        tenantName: TENANT_NAME,
        roles: ["tutor"],
      })

      setParentData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        tenantName: TENANT_NAME,
        roles: ["parent"],
      })

      // Reset UI states
      setShowConfirmPassword(false)
      setActiveTab("student")
      setCreationMode("student")

      // Refresh the router cache before redirecting
      router.refresh()

      // Redirect to students list
      router.push("/tutor/students")
    } catch (err) {
      console.error("Error creating users:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
      setCreationProgress("")
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

  // Get the available tabs for the current creation mode
  const availableTabs = getAvailableTabs()

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Add New Student</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Creation Mode</CardTitle>
          <CardDescription>Select what you want to create</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Select
                value={creationMode}
                onValueChange={(value) => handleCreationModeChange(value as CreationMode)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select creation mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Create Student Only</SelectItem>
                  <SelectItem value="student-parent">Create Student & Parent</SelectItem>
                  <SelectItem value="student-tutor">Create Student & Tutor</SelectItem>
                  <SelectItem value="student-parent-tutor">Create Student, Parent & Tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {creationProgress && (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertDescription>{creationProgress}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
          {availableTabs.includes("student") && <TabsTrigger value="student">Student Information</TabsTrigger>}
          {availableTabs.includes("parent") && <TabsTrigger value="parent">Parent Information</TabsTrigger>}
          {availableTabs.includes("tutor") && <TabsTrigger value="tutor">Tutor Information</TabsTrigger>}
        </TabsList>

        {/* Student Tab */}
        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Enter the details for the new student</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentFirstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="studentFirstName"
                      name="firstName"
                      value={studentData.firstName}
                      onChange={handleStudentChange}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentLastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="studentLastName"
                      name="lastName"
                      value={studentData.lastName}
                      onChange={handleStudentChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentEmail">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentEmail"
                    name="email"
                    type="email"
                    value={studentData.email}
                    onChange={handleStudentChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Use the shared PasswordInput component */}
                <PasswordInput
                  id="studentPassword"
                  value={studentData.password}
                  onChange={(value) => handlePasswordChange("student", value)}
                  disabled={isLoading}
                  label="Password"
                  required={true}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Select
                      value={studentData.gradeLevel}
                      onValueChange={(value) => handleSelectChange("student", "gradeLevel", value)}
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              {availableTabs.length > 1 && availableTabs.indexOf(activeTab) < availableTabs.length - 1 ? (
                <Button onClick={handleNextButtonClick} disabled={isLoading}>
                  Next: {availableTabs[availableTabs.indexOf(activeTab) + 1] === "parent" ? "Parent" : "Tutor"}{" "}
                  Information
                </Button>
              ) : (
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
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Parent Tab */}
        <TabsContent value="parent">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Enter the details for the student's parent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="parentFirstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="parentFirstName"
                      name="firstName"
                      value={parentData.firstName}
                      onChange={handleParentChange}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentLastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="parentLastName"
                      name="lastName"
                      value={parentData.lastName}
                      onChange={handleParentChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="parentEmail"
                    name="email"
                    type="email"
                    value={parentData.email}
                    onChange={handleParentChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Use the shared PasswordInput component */}
                <PasswordInput
                  id="parentPassword"
                  value={parentData.password}
                  onChange={(value) => handlePasswordChange("parent", value)}
                  disabled={isLoading}
                  label="Password"
                  required={true}
                />

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Phone</Label>
                  <Input
                    id="parentPhone"
                    name="phone"
                    value={parentData.phone}
                    onChange={handleParentChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("student")} disabled={isLoading}>
                Back to Student
              </Button>
              {availableTabs.indexOf(activeTab) < availableTabs.length - 1 ? (
                <Button onClick={handleNextButtonClick} disabled={isLoading}>
                  Next: Tutor Information
                </Button>
              ) : (
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
                  ) : creationMode === "student-parent" ? (
                    "Create Student & Parent"
                  ) : (
                    "Create All"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tutor Tab */}
        <TabsContent value="tutor">
          <Card>
            <CardHeader>
              <CardTitle>Tutor Information</CardTitle>
              <CardDescription>Enter the details for the tutor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tutorFirstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tutorFirstName"
                      name="firstName"
                      value={tutorData.firstName}
                      onChange={handleTutorChange}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tutorLastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tutorLastName"
                      name="lastName"
                      value={tutorData.lastName}
                      onChange={handleTutorChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutorEmail">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tutorEmail"
                    name="email"
                    type="email"
                    value={tutorData.email}
                    onChange={handleTutorChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Use the shared PasswordInput component */}
                <PasswordInput
                  id="tutorPassword"
                  value={tutorData.password}
                  onChange={(value) => handlePasswordChange("tutor", value)}
                  disabled={isLoading}
                  label="Password"
                  required={true}
                />

                <div className="space-y-2">
                  <Label htmlFor="tutorPhone">Phone</Label>
                  <Input
                    id="tutorPhone"
                    name="phone"
                    value={tutorData.phone}
                    onChange={handleTutorChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("student")} disabled={isLoading}>
                Back to Student
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
                ) : creationMode === "student-tutor" ? (
                  "Create Student & Tutor"
                ) : (
                  "Create All"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

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
