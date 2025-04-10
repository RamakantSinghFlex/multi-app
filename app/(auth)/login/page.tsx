"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const {
    login,
    isLoading,
    error,
    successMessage,
    resetAuthError,
    clearSuccessMessage,
    isAuthenticated,
    user,
    setError,
  } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User already authenticated, redirecting...")

      // Check if there's a redirect path -- //TODO remove false later
      if (false && redirectPath) {
        router.push(redirectPath)
      } else {
        // Redirect based on user roles
        if (user.roles && user.roles.length > 0) {
          const primaryRole = user.roles[0]

          if (primaryRole === "admin") {
            router.push("/admin/dashboard")
          } else if (primaryRole === "parent") {
            router.push("/parent/dashboard")
          } else if (primaryRole === "tutor") {
            router.push("/tutor/dashboard")
          } else if (primaryRole === "student") {
            router.push("/student/dashboard")
          }
        } else {
          console.error('no role');
        }
      }
    }
  }, [isAuthenticated, user, router, redirectPath])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        clearSuccessMessage()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [successMessage, clearSuccessMessage])

  // Simple validation function
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    if (error) resetAuthError()

    console.log("Submitting login form with:", { email, password: "***" })

    try {
      await login({
        email,
        password,
      })

      // The redirection will be handled by the useEffect above
    } catch (err) {
      console.error("Unhandled login error:", err)
      // The error will be handled by the auth context
    }
  }

  // Add this to the useEffect section to handle OAuth errors
  useEffect(() => {
    // Check for OAuth error in URL
    const searchParams = new URLSearchParams(window.location.search)
    const oauthError = searchParams.get("error")

    if (oauthError) {
      let errorMessage = "Authentication failed. Please try again."

      switch (oauthError) {
        case "invalid_state":
          errorMessage = "Security verification failed. Please try again."
          break
        case "no_code":
          errorMessage = "Authentication was cancelled or failed. Please try again."
          break
        case "token_exchange_failed":
          errorMessage = "Failed to complete authentication. Please try again."
          break
        case "userinfo_failed":
          errorMessage = "Failed to retrieve user information. Please try again."
          break
        case "auth_failed":
          errorMessage = "Failed to authenticate with our system. Please try again or use email login."
          break
        case "oauth_init_failed":
          errorMessage = "Failed to start authentication. Please try again."
          break
      }

      setError(errorMessage)

      // Remove the error from the URL to prevent showing it again on refresh
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [setError])

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
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-input focus:border-primary focus:ring-primary"
              />
              {validationErrors.email && (
                <p className="text-sm font-medium text-destructive">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="border-input focus:border-primary focus:ring-primary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
              {validationErrors.password && (
                <p className="text-sm font-medium text-destructive">{validationErrors.password}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
