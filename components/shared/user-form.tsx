"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { TENANT_NAME } from "@/lib/config"

interface UserFormProps {
  userType: "student" | "tutor" | "parent"
  initialData?: any
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
  onCancel,
  isLoading = false,
  disableFields = [],
  isEditMode = false,
  readOnly = false,
  hideBackButton = false,
}: UserFormProps) {
  const [formData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
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
    <Card>
      <CardHeader>
        <CardTitle>{getFormTitle()}</CardTitle>
        <CardDescription>{getFormDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                readOnly
                disabled={true}
                className={readOnly ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                readOnly
                disabled={true}
                className={readOnly ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              disabled={true}
              className={readOnly ? "bg-muted cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              readOnly
              disabled={true}
              className={readOnly ? "bg-muted cursor-not-allowed" : ""}
            />
          </div>

          {/* Student-specific fields */}
          {userType === "student" && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
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
                    disabled={true}
                    className={readOnly ? "bg-muted cursor-not-allowed" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    name="school"
                    value={formData.school}
                    readOnly
                    disabled={true}
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
                  readOnly
                  disabled={true}
                  rows={3}
                  className={readOnly ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {!hideBackButton && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {readOnly ? "Back" : "Cancel"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
