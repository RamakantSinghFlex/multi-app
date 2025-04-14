"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, ChevronRight, Plus, BookOpen, Calendar, Layers } from "lucide-react"
import { MetricCard } from "@/components/ui/metric-card"
import { ProgressCircle } from "@/components/ui/progress-circle"
import { CalendarView } from "@/components/ui/calendar-view"
import { ScheduleItem } from "@/components/ui/schedule-item"
import { TestCard } from "@/components/ui/test-card"
import { TutorCard } from "@/components/ui/tutor-card"
import { useSearchParams } from "next/navigation"

export default function DashboardPage() {
  const { user, successMessage, clearSuccessMessage, isLoading, checkAuth } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const welcomeParam = searchParams.get("welcome")

  useEffect(() => {
    // Check for welcome parameter
    if (welcomeParam === "new") {
      setWelcomeMessage("Welcome to Milestone Learning! Your account has been created successfully.")
    } else if (welcomeParam === "returning") {
      setWelcomeMessage("Welcome back! You've successfully signed in with Google.")
    }
    setWelcomeMessage("Welcome back! You've successfully signed in with Google.")

    // Clear welcome message after 10 seconds
    if (welcomeMessage) {
      const timer = setTimeout(() => {
        setWelcomeMessage(null)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [welcomeParam, welcomeMessage])

  useEffect(() => {
    // Ensure user data is available after refresh
    if (!user && !isLoading) {
      const checkAuthCall = async () => {
        try {
          await checkAuth()
        } catch (err) {
          console.error("Error checking auth on dashboard:", err)
        }
      }

      checkAuthCall()
    }
  }, [user, isLoading, checkAuth])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      try {
        // Simulate data fetching
        setLoading(false)
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
        setLoading(false)
      }
    }, 1000)

    // Set a timeout to show a message if loading takes too long
    const timeoutTimer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true)
      }
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearTimeout(timeoutTimer)
    }
  }, [])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        clearSuccessMessage()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [successMessage, clearSuccessMessage])

  // If there's an error loading the dashboard
  if (error) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 p-4 md:p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    )
  }

  // Show a loading state
  if (loading) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 p-4 md:p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg">Loading dashboard...</p>

        {loadingTimeout && (
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Loading is taking longer than expected. Please wait or refresh the page.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {welcomeMessage && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{welcomeMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard value="10" label="Total School Subject" icon={<BookOpen className="h-4 w-4" />} />
        <MetricCard value="07" label="Total Session Taken" icon={<Calendar className="h-4 w-4" />} />
        <MetricCard value="05" label="Total Document Uploaded" icon={<Layers className="h-4 w-4" />} />
      </div>

      {/* Progress and Upcoming Tests */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Progress Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Otis's Progress Overview</CardTitle>
            <span className="text-xs text-[#858585]">Current Semester</span>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col items-center">
                <ProgressCircle value={20} max={60} size={100} label="20" sublabel="completed" />
                <p className="mt-2 text-xs font-medium">School Assignment</p>
                <p className="text-xs text-[#858585]">40 remaining</p>
              </div>
              <div className="flex flex-col items-center">
                <ProgressCircle value={5} max={25} size={100} label="5" sublabel="completed" />
                <p className="mt-2 text-xs font-medium">Test Prep</p>
                <p className="text-xs text-[#858585]">20 remaining</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#f1f1f1] pt-4">
              <div className="flex items-center text-xs text-[#095d40]">
                <span>View all assignments</span>
                <ChevronRight className="ml-1 h-3 w-3" />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center border-[#d9d9d9] text-xs text-[#000000] hover:bg-[#f4f4f4]"
              >
                <Plus className="mr-1 h-3 w-3" />
                <span>Add Another Student</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <TestCard
              date={{ day: 15, month: "APR" }}
              title="Geometry"
              subtitle="8th Standard | Group B"
              time="1:00 PM to 1:30 PM"
            />
            <TestCard
              date={{ day: 5, month: "MAY" }}
              title="Algebra"
              subtitle="8th Standard | Group B"
              time="1:00 PM to 1:30 PM"
            />
            <TestCard
              date={{ day: 20, month: "MAY" }}
              title="Physics"
              subtitle="8th Standard | Group B"
              time="1:00 PM to 1:30 PM"
            />
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <CalendarView
          initialMonth={new Date(2025, 2)} // March 2025
          highlightedDates={[new Date(2025, 2, 17)]} // March 17, 2025
        />

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <ScheduleItem time="04:30 PM" title="Otis's Match Class" subtitle="with Mr. Will" />

              <div className="py-2">
                <p className="text-xs font-medium text-[#858585]">Fri, Mar 18</p>
              </div>

              <ScheduleItem time="04:30 PM" title="Otis's Match Class" subtitle="with Mr. Will" />

              <ScheduleItem time="10:30 AM" title="Otis's Essay Submission" subtitle="at school" />
            </div>

            <Button className="mt-6 w-full bg-[#095d40] text-white hover:bg-[#02342e]">Book A Session</Button>
          </CardContent>
        </Card>
      </div>

      {/* Session Notes */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f4f4f4] text-xs font-medium text-[#858585]">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Note Summary</th>
                <th className="p-2 text-left">Tutor</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-[#f1f1f1]">
                <td className="p-2">04-Mar</td>
                <td className="p-2">
                  The student demonstrated strengths in basic algebraic operations, grasping the concept of equal
                  operations in equations, recalling triangle...
                </td>
                <td className="p-2">Mark Jason</td>
                <td className="p-2">
                  <div className="flex items-center text-xs text-[#095d40]">
                    <span>View Details</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-2">02-Mar</td>
                <td className="p-2">
                  The student demonstrated strengths in basic algebraic operations, grasping the concept of equal
                  operations in equations...
                </td>
                <td className="p-2">Mark Jason</td>
                <td className="p-2">
                  <div className="flex items-center text-xs text-[#095d40]">
                    <span>View Details</span>
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <Button variant="outline" className="mt-4 w-full text-xs text-[#858585] hover:bg-[#f4f4f4]">
            Load more
          </Button>
        </CardContent>
      </Card>

      {/* Current Tutors */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <TutorCard
              name="Mark Jason"
              subject="Math"
              image="/placeholder.svg?height=40&width=40&text=MJ"
              status="active"
              completedSessions={2}
              upcomingSessions={1}
            />

            <TutorCard
              name="Devon"
              subject="Chemistry"
              image="/placeholder.svg?height=40&width=40&text=D"
              status="closed"
              completedSessions={5}
              upcomingSessions={0}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
