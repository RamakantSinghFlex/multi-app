"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { patchUser } from "@/lib/api/users"
import { Loader2, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"

export function HourlyRateSettings() {
  const { user, setUser } = useAuth()
  const { toast } = useToast()
  const [hourlyRate, setHourlyRate] = useState<number>(user?.hourlyRate || 50)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    setHourlyRate(isNaN(value) ? 0 : value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hourlyRate < 0) {
      toast({
        title: "Invalid Rate",
        description: "Hourly rate cannot be negative",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use PATCH method instead of upsert
      const response = await patchUser(user?.id as string, {
        hourlyRate,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      // Update the user in the auth context
      if (response.data && setUser) {
        setUser({
          ...user,
          hourlyRate,
        })
      }

      // Set success message and show modal instead of just toast
      setSuccessMessage(response.data?.message || "Your hourly rate has been updated successfully")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error updating hourly rate:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update hourly rate",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Rate</CardTitle>
        <CardDescription>
          Set your hourly rate for tutoring sessions. This rate will be used to calculate the cost of appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={handleRateChange}
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This rate will be used to calculate the cost of appointments booked by students and parents.
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Rate"
          )}
        </Button>
      </CardFooter>
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Success
            </DialogTitle>
            <DialogDescription>{successMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
