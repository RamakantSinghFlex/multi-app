"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Lock, Bell } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"

export default function StudentSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    newMessages: true,
    marketingEmails: false,
  })

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, you would update the password via API
      console.log("Updating password with:", passwordForm)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success message
      console.log("Password updated successfully")

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, you would update notification settings via API
      console.log("Updating notification settings with:", notificationSettings)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success message
      console.log("Notification settings updated successfully")
    } catch (error) {
      console.error("Error updating notification settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-[#858585]">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="password" className="space-y-4">
        <TabsList>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Change Password</CardTitle>
              <CardDescription className="text-xs text-[#858585]">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <PasswordInput
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(value) => handlePasswordChange("currentPassword", value)}
                  disabled={loading}
                  label="Current Password"
                  required={true}
                />

                <PasswordInput
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(value) => handlePasswordChange("newPassword", value)}
                  disabled={loading}
                  label="New Password"
                  showStrengthIndicator={true}
                  required={true}
                />

                <PasswordInput
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(value) => handlePasswordChange("confirmPassword", value)}
                  disabled={loading}
                  label="Confirm New Password"
                  required={true}
                />

                <Button type="submit" disabled={loading} className="bg-[#095d40] text-white hover:bg-[#02342e]">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Notification Preferences</CardTitle>
              <CardDescription className="text-xs text-[#858585]">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-xs text-[#858585]">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sessionReminders">Session Reminders</Label>
                      <p className="text-xs text-[#858585]">Receive reminders before scheduled sessions</p>
                    </div>
                    <Switch
                      id="sessionReminders"
                      checked={notificationSettings.sessionReminders}
                      onCheckedChange={(checked) => handleNotificationChange("sessionReminders", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newMessages">New Messages</Label>
                      <p className="text-xs text-[#858585]">Get notified when you receive new messages</p>
                    </div>
                    <Switch
                      id="newMessages"
                      checked={notificationSettings.newMessages}
                      onCheckedChange={(checked) => handleNotificationChange("newMessages", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-xs text-[#858585]">Receive promotional emails and updates</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="bg-[#095d40] text-white hover:bg-[#02342e]">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Privacy Settings</CardTitle>
              <CardDescription className="text-xs text-[#858585]">Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-xs text-[#858585]">Control who can see your profile information</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-[#d9d9d9] text-[#000000] hover:bg-[#f4f4f4]">
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Usage</Label>
                    <p className="text-xs text-[#858585]">Manage how your data is used</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-[#d9d9d9] text-[#000000] hover:bg-[#f4f4f4]">
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Account Data</Label>
                    <p className="text-xs text-[#858585]">Download or delete your account data</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-[#d9d9d9] text-[#000000] hover:bg-[#f4f4f4]">
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
