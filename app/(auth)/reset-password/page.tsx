"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordInput } from "@/components/ui/password-input"
import { resetPassword } from "@/lib/api/auth"
import { logger } from "@/lib/monitoring"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    password?: string
    confirmPassword?: string
    token?: string
  }>({})

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setValidationErrors((prev) => ({
        ...prev,
        token: "Reset token is missing. Please use the link from the email.",
      }))
    }
  }, [token])

  // Simple validation function
  const validateForm = () => {
    const errors: {
      password?: string
      confirmPassword?: string
      token?: string
    } = {}

    if (!token) {
      errors.token = "Reset token is missing. Please use the link from the email."
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter"
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter"
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number"
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      logger.info("Submitting password reset request")

      if (!token) {
        throw new Error("Reset token is missing")
      }

      const response = await resetPassword(token, password)

      if (response.error) {
        logger.error("Password reset failed", { error: response.error })
        setError(response.error)
      } else {
        logger.info("Password reset successful")
        setSuccess(true)

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err) {
      logger.error("Unexpected error during password reset", { error: err })
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.")
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
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {validationErrors.token && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationErrors.token}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Your password has been reset successfully. You will be redirected to the login page.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                disabled={isLoading || !token}
                label="New Password"
                autoComplete="new-password"
                required={true}
                error={validationErrors.password}
                showStrengthIndicator={true}
              />

              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={isLoading || !token}
                label="Confirm New Password"
                autoComplete="new-password"
                required={true}
                error={validationErrors.confirmPassword}
              />

              <Button type="submit" disabled={isLoading || !token} className="w-full">
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
