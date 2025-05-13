"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { API_URL, FEATURES, DEV_CONFIG } from "@/lib/config"
import { logger } from "@/lib/monitoring"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Simple validation function
  const validateForm = () => {
    if (!email) {
      setValidationError("Email is required")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address")
      return false
    }

    setValidationError(null)
    return true
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
      logger.info("Submitting forgot password request", { email })

      // For development/testing, simulate a successful response
      if (FEATURES.MOCK_API) {
        logger.info("DEV MODE: Simulating successful forgot password request")

        if (DEV_CONFIG.SIMULATE_SLOW_API) {
          await new Promise((resolve) => setTimeout(resolve, DEV_CONFIG.SLOW_API_DELAY))
        }

        setSuccess(true)
        setIsLoading(false)
        return
      }

      // Make the API request directly to match the curl command format
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      })

      logger.info("Forgot password response status:", response.status)

      // For security reasons, we don't want to reveal if an email exists or not
      // So we return a success message even if there was an error
      if (!response.ok) {
        logger.warn("Forgot password request failed, but returning generic success message for security")
        setSuccess(true)
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      logger.error("Unexpected error during forgot password request", { error: err })
      // For security reasons, still show success even if there was an error
      setSuccess(true)
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
            <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
          </div>
          <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password</CardDescription>
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
              <AlertDescription>
                If an account exists with that email, we&apos;ve sent password reset instructions to your inbox.
              </AlertDescription>
            </Alert>
          ) : (
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
                {validationError && <p className="text-sm font-medium text-destructive">{validationError}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
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
