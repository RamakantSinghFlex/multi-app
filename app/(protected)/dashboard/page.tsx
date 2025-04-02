"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { BookOpen, Clock, Award, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user, successMessage, clearSuccessMessage, isLoading, checkAuth } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

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
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#02342e] md:text-3xl">Dashboard</h1>
          <p className="text-[#9d968d]">Welcome back, {user?.firstName || user?.email || "User"}!</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-[#095d40] hover:bg-[#02342e]">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">Courses</p>
                <h3 className="text-2xl font-bold text-[#02342e]">12</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">In Progress</p>
                <h3 className="text-2xl font-bold text-[#02342e]">4</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">Completed</p>
                <h3 className="text-2xl font-bold text-[#02342e]">8</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">Certificates</p>
                <h3 className="text-2xl font-bold text-[#02342e]">3</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="recent" className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]">
            Recent Content
          </TabsTrigger>
          <TabsTrigger
            value="recommended"
            className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]"
          >
            Recommended
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]">
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Sample static content */}
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
                  <div className="aspect-video bg-[#e9f3f1]">
                    <Image
                      src={`/placeholder.svg?height=200&width=400&text=Course ${i + 1}`}
                      alt={`Course ${i + 1}`}
                      width={400}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-[#02342e]">Course {i + 1}</h3>
                    <p className="mt-1 text-sm text-[#9d968d]">Sample course description for demonstration purposes.</p>
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-[#d9d9d9] text-[#095d40] hover:bg-[#eaf4ed] hover:text-[#095d40]"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="rounded-lg bg-white p-8 text-center">
            <h3 className="text-lg font-medium text-[#02342e]">Personalized Recommendations</h3>
            <p className="mt-2 text-[#9d968d]">
              Continue learning to get personalized recommendations based on your interests.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <div className="rounded-lg bg-white p-8 text-center">
            <h3 className="text-lg font-medium text-[#02342e]">Popular Content</h3>
            <p className="mt-2 text-[#9d968d]">Discover what other learners are finding valuable.</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#02342e]">Your Progress</CardTitle>
            <CardDescription className="text-[#9d968d]">Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#2c2c2c]">Introduction to React</span>
                  <span className="text-xs text-[#9d968d]">75%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e8e8e8]">
                  <div className="h-2 w-3/4 rounded-full bg-[#095d40]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#2c2c2c]">Advanced JavaScript</span>
                  <span className="text-xs text-[#9d968d]">45%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e8e8e8]">
                  <div className="h-2 w-2/5 rounded-full bg-[#095d40]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#2c2c2c]">UI/UX Fundamentals</span>
                  <span className="text-xs text-[#9d968d]">90%</span>
                </div>
                <div className="h-2 rounded-full bg-[#e8e8e8]">
                  <div className="h-2 w-[90%] rounded-full bg-[#095d40]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#02342e]">Upcoming Events</CardTitle>
            <CardDescription className="text-[#9d968d]">Stay updated with scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-[#eaf4ed] text-[#095d40]">
                  <span className="text-xs font-medium">APR</span>
                  <span className="text-lg font-bold">15</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#2c2c2c]">Web Development Workshop</h4>
                  <p className="text-sm text-[#9d968d]">10:00 AM - 12:00 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-[#eaf4ed] text-[#095d40]">
                  <span className="text-xs font-medium">APR</span>
                  <span className="text-lg font-bold">22</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#2c2c2c]">Design Systems Webinar</h4>
                  <p className="text-sm text-[#9d968d]">2:00 PM - 3:30 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-[#eaf4ed] text-[#095d40]">
                  <span className="text-xs font-medium">MAY</span>
                  <span className="text-lg font-bold">05</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#2c2c2c]">Career Development Session</h4>
                  <p className="text-sm text-[#9d968d]">11:00 AM - 1:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

