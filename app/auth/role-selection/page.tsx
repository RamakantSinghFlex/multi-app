"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { logger } from "@/lib/monitoring"

export default function RoleSelectionPage() {
  const [role, setRole] = useState<"parent" | "tutor">("parent")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [googleUser, setGoogleUser] = useState<any>(null)
  const [isCheckingCookie, setIsCheckingCookie] = useState(true)

  const router = useRouter()

  // Check if the Google user info cookie exists
  useEffect(() => {
    const checkGoogleUserInfo = async () => {
      try {
        // Make a request to an API endpoint that can read the cookie
        const response = await fetch("/api/auth/check-google-user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.googleUser) {
            setGoogleUser(data.googleUser)
          } else {
            // No Google user info found, redirect to login
            router.push("/login?error=no_google_user")
          }
        } else {
          // Error checking Google user info, redirect to login
          router.push("/login?error=google_user_check_failed")
        }
      } catch (error) {
        console.error("Error checking Google user info:", error)
        router.push("/login?error=google_user_check_failed")
      } finally {
        setIsCheckingCookie(false)
      }
    }

    checkGoogleUserInfo()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      logger.info("Submitting role selection", { role })

      const response = await fetch("/api/auth/create-google-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred while creating your account. Please try again.")
        setIsLoading(false)
        return
      }

      setSuccess("Account created successfully! Redirecting to your dashboard...")

      // Redirect to the appropriate dashboard based on role
      setTimeout(() => {
        if (role === "parent") {
          router.push("/parent/dashboard?welcome=new")
        } else if (role === "tutor") {
          router.push("/tutor/dashboard?welcome=new")
        } else {
          router.push("/dashboard?welcome=new")
        }
      }, 1500)
    } catch (error) {
      console.error("Error creating user:", error)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // Show loading state while checking for the cookie
  if (isCheckingCookie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8">
          <Image
            src="/placeholder.svg?height=60&width=200&text=Milestone+Learning"
            alt="Milestone Learning Logo"
            width={200}
            height={60}
            className="h-auto w-auto"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">Verifying your Google sign-in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Image
          src="/placeholder.svg?height=60&width=200&text=Milestone+Learning"
          alt="Milestone Learning Logo"
          width={200}
          height={60}
          className="h-auto w-auto"
        />
      </div>

      <Card className="w-full max-w-md border-0 shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to Milestone Learning</CardTitle>
          <CardDescription>
            {googleUser ? (
              <>
                You're signing up with <span className="font-medium">{googleUser.email}</span>. Please select your role
                to continue.
              </>
            ) : (
              "Please select your role to continue."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">I am a</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as "parent" | "tutor")}
                className="grid grid-cols-2 gap-4"
              >
                <div className="relative flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                  <RadioGroupItem value="parent" id="parent" className="sr-only" />
                  <Label
                    htmlFor="parent"
                    className="flex cursor-pointer flex-col items-center justify-between gap-2 text-center"
                  >
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div className="font-medium">Parent</div>
                    <div className="text-sm text-muted-foreground">I'm looking for tutoring services for my child</div>
                  </Label>
                </div>

                <div className="relative flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                  <RadioGroupItem value="tutor" id="tutor" className="sr-only" />
                  <Label
                    htmlFor="tutor"
                    className="flex cursor-pointer flex-col items-center justify-between gap-2 text-center"
                  >
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    <div className="font-medium">Tutor</div>
                    <div className="text-sm text-muted-foreground">I want to provide tutoring services</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="font-medium text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

