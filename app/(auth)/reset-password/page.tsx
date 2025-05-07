"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_URL, FEATURES, DEV_CONFIG } from "@/lib/config"
import { logger } from "@/lib/monitoring"
import { PasswordInput } from "@/components/ui/password-input"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const collection = searchParams.get("collection") || "users"

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing. Please request a new password reset link.")
    }
  }, [token])

  // Validate the form
  const validateForm = () => {
    if (!password) {
      setValidationError("Password is required")
      return false
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long")
      return false
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return false
    }

    setValidationError(null)
    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError("Reset token is missing. Please request a new password reset link.")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      logger.info("Submitting password reset request")

      // For development/testing, simulate a successful response
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful password reset")

        if (DEV_CONFIG.SIMULATE_SLOW_API) {
          await new Promise((resolve) => setTimeout(resolve, DEV_CONFIG.SLOW_API_DELAY))
        }

        setSuccess(true)
        setIsLoading(false)

        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push("/login?resetSuccess=true")
        }, 2000)

        return
      }

      // Make the API request directly to match the format
      const response = await fetch(`${API_URL}/${collection}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      })

      logger.info("Password reset response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || "Failed to reset password. Please try again."
        logger.error("Password reset failed:", errorMessage)
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login?resetSuccess=true")
      }, 2000)
    } catch (err) {
      logger.error("Unexpected error during password reset", { error: err })
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-2 p-0" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to login</span>
              </Link>
            </Button>
            <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          </div>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Your password has been successfully reset. Redirecting to login...</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                onGeneratePassword={(newPassword) => setConfirmPassword(newPassword)}
                disabled={isLoading || !token}
                label="New Password"
                placeholder="••••••••"
                showStrengthIndicator={true}
                error={validationError && validationError.includes("Password") ? validationError : undefined}
              />

              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={isLoading || !token}
                label="Confirm Password"
                placeholder="••••••••"
                showGenerateButton={false}
                error={validationError && validationError.includes("match") ? validationError : undefined}
              />

              <Button type="submit" disabled={isLoading || !token || !password || !confirmPassword} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
