"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createUser } from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"
import { ErrorModal, parseApiError, type ApiError } from "@/components/ui/error-modal"
import { getMe } from "@/lib/api" // Import getMe directly instead of using useAuth
import type { User } from "@/lib/types"
import { TENANT_NAME } from "@/lib/config"
import { UserForm } from "@/components/shared/user-form"
import { PasswordDisplayModal } from "@/components/shared/password-display-modal"
import { generateSecurePassword } from "@/lib/utils/password-generator"

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

  // Generate secure passwords for each user type
  const studentPassword = generateSecurePassword()
  const parentPassword = generateSecurePassword()
  const tutorPassword = generateSecurePassword()

  // Student form state
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: studentPassword,
    gradeLevel: "",
    school: "",
    notes: "",
    tenantName: TENANT_NAME, // Add default tenant name
    roles: ["student"],
  })

  // Tutor form state
  const [tutorData, setTutorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: tutorPassword,
    phone: "",
    tenantName: TENANT_NAME,
    roles: ["tutor"],
  })

  // Parent form state
  const [parentData, setParentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: parentPassword,
    phone: "",
    tenantName: TENANT_NAME,
    roles: ["parent"],
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("student")
  const [creationProgress, setCreationProgress] = useState("")

  // Add state for the password display modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [createdUsers, setCreatedUsers] = useState<Array<{ email: string; userType: string; name?: string }>>([])

  // Get available tabs based on creation mode
  const getAvailableTabs = (): TabType[] => {
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
  }

  // Update active tab when creation mode changes
  useEffect(() => {
    const availableTabs = getAvailableTabs()
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0])
    }
  }, [creationMode, activeTab])

  // Handle creation mode change
  const handleCreationModeChange = (mode: CreationMode) => {
    setCreationMode(mode)
    setError(null)
  }

  // Modify the validateCurrentTab function to accept form data as a parameter
  const validateCurrentTab = (formData?: any): boolean => {
    // Use the passed form data or fall back to the state data
    const dataToValidate =
      formData || (activeTab === "student" ? studentData : activeTab === "parent" ? parentData : tutorData)

    if (activeTab === "student") {
      if (!dataToValidate.firstName || !dataToValidate.lastName || !dataToValidate.email) {
        setError("Please fill in all required student fields")
        return false
      }
    } else if (activeTab === "parent") {
      if (!dataToValidate.firstName || !dataToValidate.lastName || !dataToValidate.email) {
        setError("Please fill in all required parent fields")
        return false
      }
    } else if (activeTab === "tutor") {
      if (!dataToValidate.firstName || !dataToValidate.lastName || !dataToValidate.email) {
        setError("Please fill in all required tutor fields")
        return false
      }
    }
    return true
  }

  // Update the handleNextButtonClick function to use the current state
  const handleNextButtonClick = () => {
    if (validateCurrentTab()) {
      setError(null)
      const availableTabs = getAvailableTabs()
      const currentIndex = availableTabs.indexOf(activeTab)
      if (currentIndex < availableTabs.length - 1) {
        setActiveTab(availableTabs[currentIndex + 1])
      }
    }
  }

  // Update the handleStudentSubmit function to validate with the current form data
  const handleStudentSubmit = async (data: any) => {
    // Validate with the current form data
    if (!validateCurrentTab(data)) {
      return
    }

    // Make sure we're not losing any fields during the update
    setStudentData({
      ...studentData,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gradeLevel: data.gradeLevel,
      school: data.school,
      notes: data.notes,
      // Keep the password we generated
      password: studentPassword,
    })

    // Store the generated password in localStorage for temporary access
    try {
      const passwordsMap = JSON.parse(localStorage.getItem("generatedPasswords") || "{}")
      passwordsMap[data.email] = studentPassword
      localStorage.setItem("generatedPasswords", JSON.stringify(passwordsMap))
    } catch (err) {
      console.error("Error storing password in localStorage:", err)
    }

    if (getAvailableTabs().length > 1) {
      handleNextButtonClick()
    } else {
      await handleSubmit()
    }
  }

  // Update the handleParentSubmit function to validate with the current form data
  const handleParentSubmit = async (data: any) => {
    // Validate with the current form data
    if (!validateCurrentTab(data)) {
      return
    }

    // Make sure we're not losing any fields during the update
    setParentData({
      ...parentData,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      // Keep the password we generated
      password: parentPassword,
    })

    // Store the generated password in localStorage for temporary access
    try {
      const passwordsMap = JSON.parse(localStorage.getItem("generatedPasswords") || "{}")
      passwordsMap[data.email] = parentPassword
      localStorage.setItem("generatedPasswords", JSON.stringify(passwordsMap))
    } catch (err) {
      console.error("Error storing password in localStorage:", err)
    }

    if (getAvailableTabs().indexOf("parent") < getAvailableTabs().length - 1) {
      handleNextButtonClick()
    } else {
      await handleSubmit()
    }
  }

  // Update the handleTutorSubmit function to validate with the current form data
  const handleTutorSubmit = async (data: any) => {
    // Validate with the current form data
    if (!validateCurrentTab(data)) {
      return
    }

    // Make sure we're not losing any fields during the update
    setTutorData({
      ...tutorData,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      // Keep the password we generated
      password: tutorPassword,
    })

    // Store the generated password in localStorage for temporary access
    try {
      const passwordsMap = JSON.parse(localStorage.getItem("generatedPasswords") || "{}")
      passwordsMap[data.email] = tutorPassword
      localStorage.setItem("generatedPasswords", JSON.stringify(passwordsMap))
    } catch (err) {
      console.error("Error storing password in localStorage:", err)
    }

    await handleSubmit()
  }

  // Handle modal close and redirect
  const handleModalClose = () => {
    setShowPasswordModal(false)
    // Redirect to students list when modal is closed
    router.push("/parent/students")
  }

  // Handle form submission
  const handleSubmit = async () => {
    // We've already validated in the individual form submit handlers
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
        }

        // Only add the current user ID to parents if it exists
        if (userId) {
          parentPayload.parents = [userId]
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
        }

        // Add parents array only if we have valid parent IDs
        const parentIds = []
        if (userId) parentIds.push(userId)
        if (createdParent?.id) parentIds.push(createdParent.id)

        if (parentIds.length > 0) {
          tutorPayload.parents = parentIds
        }

        const tutorResponse = await createUser(tutorPayload)

        if (tutorResponse.error) {
          handleApiError(tutorResponse.error, "Error creating tutor")
          return
        }

        createdTutor = tutorResponse.data
      }

      // Prepare the list of created users for the password modal
      const usersWithPasswords = []
      if (createdStudent) {
        usersWithPasswords.push({
          email: createdStudent.email,
          userType: "student",
          name: `${createdStudent.firstName} ${createdStudent.lastName}`,
        })
      }
      if (createdParent) {
        usersWithPasswords.push({
          email: createdParent.email,
          userType: "parent",
          name: `${createdParent.firstName} ${createdParent.lastName}`,
        })
      }
      if (createdTutor) {
        usersWithPasswords.push({
          email: createdTutor.email,
          userType: "tutor",
          name: `${createdTutor.firstName} ${createdTutor.lastName}`,
        })
      }

      // Set the created users and show the password modal
      setCreatedUsers(usersWithPasswords)
      setShowPasswordModal(true)

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
        description: (
          <div>
            {successMessage}
            <p className="mt-2 text-sm">Passwords have been generated and stored temporarily.</p>
          </div>
        ),
        duration: 5000, // Keep toast visible for 5 seconds
      })

      // Reset all form states
      setStudentData({
        firstName: "",
        lastName: "",
        email: "",
        password: generateSecurePassword(),
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
        password: generateSecurePassword(),
        phone: "",
        tenantName: TENANT_NAME,
        roles: ["tutor"],
      })

      setParentData({
        firstName: "",
        lastName: "",
        email: "",
        password: generateSecurePassword(),
        phone: "",
        tenantName: TENANT_NAME,
        roles: ["parent"],
      })

      // Reset UI states
      setActiveTab("student")
      setCreationMode("student")

      // Refresh the router cache
      router.refresh()

      // No automatic redirect - we'll redirect when the user closes the modal
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
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={creationMode}
                onChange={(e) => handleCreationModeChange(e.target.value as CreationMode)}
                disabled={isLoading}
              >
                <option value="student">Create Student Only</option>
                <option value="student-parent">Create Student & Parent</option>
                <option value="student-tutor">Create Student & Tutor</option>
                <option value="student-parent-tutor">Create Student, Parent & Tutor</option>
              </select>
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
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
          {availableTabs.includes("student") && <TabsTrigger value="student">Student Information</TabsTrigger>}
          {availableTabs.includes("parent") && <TabsTrigger value="parent">Parent Information</TabsTrigger>}
          {availableTabs.includes("tutor") && <TabsTrigger value="tutor">Tutor Information</TabsTrigger>}
        </TabsList>

        {/* Student Tab */}
        <TabsContent value="student">
          <UserForm
            userType="student"
            initialData={studentData}
            onSubmit={handleStudentSubmit}
            onCancel={() => router.back()}
            isLoading={isLoading || userLoading}
          />
        </TabsContent>

        {/* Parent Tab */}
        <TabsContent value="parent">
          <UserForm
            userType="parent"
            initialData={parentData}
            onSubmit={handleParentSubmit}
            onCancel={() => setActiveTab("student")}
            isLoading={isLoading || userLoading}
          />
        </TabsContent>

        {/* Tutor Tab */}
        <TabsContent value="tutor">
          <UserForm
            userType="tutor"
            initialData={tutorData}
            onSubmit={handleTutorSubmit}
            onCancel={() => setActiveTab(availableTabs.includes("parent") ? "parent" : "student")}
            isLoading={isLoading || userLoading}
          />
        </TabsContent>
      </Tabs>

      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={apiErrors}
        title="Error Creating Student"
        description="Please correct the following errors and try again."
      />

      {/* Password Display Modal */}
      <PasswordDisplayModal
        open={showPasswordModal}
        onOpenChange={handleModalClose}
        users={createdUsers}
        currentUserRole="parent" // Pass the current user role
        showCloseButton={true} // Add close button to redirect
      />
    </div>
  )
}
