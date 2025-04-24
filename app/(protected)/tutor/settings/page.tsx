"use client"

import { useState } from "react"
import { HourlyRateSettings } from "@/components/tutor/hourly-rate-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserForm } from "@/components/shared/user-form"
import { useAuth } from "@/lib/auth-context"
import { updateUser } from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function TutorSettingsPage() {
  const { user, setUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleProfileUpdate = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await updateUser(user?.id as string, data)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && setUser) {
        setUser({
          ...user,
          ...response.data,
        })
      }

      toast({
        title: "Success",
        description: "Your profile has been updated",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="rate">Hourly Rate</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserForm
            userType="tutor"
            initialData={user}
            onSubmit={handleProfileUpdate}
            onCancel={() => router.back()}
            isLoading={isLoading}
            disableFields={["email"]} // Disable email editing
          />
        </TabsContent>

        <TabsContent value="rate">
          <HourlyRateSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
