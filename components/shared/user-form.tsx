"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { TENANT_NAME } from "@/lib/config"
import { generateSecurePassword } from "@/lib/utils/password-generator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserFormProps {
  userType: "student" | "tutor" | "parent"
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
  disableFields?: string[]
  isEditMode?: boolean
  readOnly?: boolean
  hideBackButton?: boolean
}

export function UserForm({
  userType,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  disableFields = [],
  isEditMode = false,
  readOnly = false,
  hideBackButton = false,
}: UserFormProps) {
  // Generate a secure password if one isn't provided
  const generatedPassword = generateSecurePassword()

  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    password: initialData.password || generatedPassword, // Generate password automatically
    phone: initialData.phone || "",
    // Student-specific fields
    gradeLevel: initialData.gradeLevel || "",
    school: initialData.school || "",
    notes: initialData.notes || "",
    // Include roles and tenant name
    roles: initialData.roles || [userType],
    tenantName: initialData.tenantName || TENANT_NAME,
    // Include other fields as needed
    ...initialData,
  })

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Get the form title based on user type and edit mode
  const getFormTitle = () => {
    const typeLabel = userType === "student" ? "Student" : userType === "tutor" ? "Tutor" : "Parent"
    return readOnly ? `${typeLabel} Profile` : isEditMode ? `Edit ${typeLabel} Information` : `${typeLabel} Information`
  }

  // Get the form description based on user type and read-only status
  const getFormDescription = () => {
    if (readOnly) {
      return `Your profile information`
    }
    return isEditMode ? `Update the details for the ${userType}` : `Enter the details for the ${userType}`
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{getFormTitle()}</CardTitle>
          <CardDescription>{getFormDescription()}</CardDescription>
          {!readOnly && (
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              Fields marked with <span className="text-red-500">*</span> are required.
            </CardDescription>
          )}
          {!readOnly && !isEditMode && (
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              A secure password will be automatically generated for this user.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  readOnly={readOnly}
                  disabled={readOnly || isLoading || disableFields.includes("firstName")}
                  className={readOnly ? "bg-muted cursor-not-allowed" : ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  readOnly={readOnly}
                  disabled={readOnly || isLoading || disableFields.includes("lastName")}
                  className={readOnly ? "bg-muted cursor-not-allowed" : ""}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly || isLoading || disableFields.includes("email")}
                className={readOnly ? "bg-muted cursor-not-allowed" : ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly={readOnly}
                disabled={readOnly || isLoading || disableFields.includes("phone")}
                className={readOnly ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            {/* Student-specific fields */}
            {userType === "student" && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    {readOnly ? (
                      <Input
                        id="gradeLevel"
                        name="gradeLevel"
                        value={
                          formData.gradeLevel === "elementary"
                            ? "Elementary School"
                            : formData.gradeLevel === "middle"
                              ? "Middle School"
                              : formData.gradeLevel === "high"
                                ? "High School"
                                : formData.gradeLevel === "college"
                                  ? "College"
                                  : formData.gradeLevel || ""
                        }
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    ) : (
                      <Select
                        value={formData.gradeLevel}
                        onValueChange={(value) => handleSelectChange("gradeLevel", value)}
                        disabled={isLoading || disableFields.includes("gradeLevel")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elementary">Elementary School</SelectItem>
                          <SelectItem value="middle">Middle School</SelectItem>
                          <SelectItem value="high">High School</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school">School</Label>
                    <Input
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      readOnly={readOnly}
                      disabled={readOnly || isLoading || disableFields.includes("school")}
                      className={readOnly ? "bg-muted cursor-not-allowed" : ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    readOnly={readOnly}
                    disabled={readOnly || isLoading || disableFields.includes("notes")}
                    rows={3}
                    className={readOnly ? "bg-muted cursor-not-allowed" : ""}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!hideBackButton && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {readOnly ? "Back" : "Cancel"}
            </Button>
          )}
          {!readOnly && (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
