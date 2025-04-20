"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2 } from "lucide-react"
import { TENANT_NAME } from "@/lib/config"

interface UserFormProps {
  userType: "student" | "tutor" | "parent"
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function UserForm({ userType, initialData = {}, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    password: initialData.password || "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userType === "student" ? "Student" : userType === "tutor" ? "Tutor" : "Parent"} Information
        </CardTitle>
        <CardDescription>Enter the details for the {userType}</CardDescription>
      </CardHeader>
      <CardContent>
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

          <PasswordInput
            id="password"
            value={formData.password}
            onChange={handlePasswordChange}
            disabled={isLoading}
            label="Password"
            required={true}
          />

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} disabled={isLoading} />
          </div>

          {/* Student-specific fields */}
          {userType === "student" && (
            <>
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
                  <Input
                    id="school"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    disabled={isLoading}
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
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            `Save ${userType === "student" ? "Student" : userType === "tutor" ? "Tutor" : "Parent"}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
