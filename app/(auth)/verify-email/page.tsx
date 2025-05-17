"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyEmail } from "@/lib/api" // Import the verifyEmail function
import { logger } from "@/lib/monitoring"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const collection = searchParams.get("collection") || "users"

  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setVerifying(false)
      setError("Verification token is missing")
      return
    }

    const handleVerification = async () => {
      try {
        logger.info("Starting email verification process", { collection })

        // Use the verifyEmail function from the API client
        const result = await verifyEmail(token, collection)

        if (result.error) {
          throw new Error(result.error)
        }

        logger.info("Email verification successful")
        setSuccess(true)

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true&redirect=/onboarding")
        }, 3000)
      } catch (err) {
        logger.error("Email verification failed:", err)
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred during verification"
        )
      } finally {
        setVerifying(false)
      }
    }

    handleVerification()
  }, [token, collection, router])

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Image
          src="/placeholder.svg?height=60&width=200&text=Milestone+Learning"
          alt="Milestone Learning Logo"
          width={200}
          height={60}
          className="h-auto w-auto"
          priority
        />
      </div>

      <Card className="w-full max-w-md border-0 shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Email Verification
          </CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>

        <CardContent>
          {verifying && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Verifying your email address...
              </p>
            </div>
          )}

          {!verifying && success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Your email has been successfully verified! Redirecting you to
                the login page...
              </AlertDescription>
            </Alert>
          )}

          {!verifying && error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t p-6">
          {!verifying && (
            <div className="flex flex-col items-center space-y-4">
              {success ? (
                <p className="text-center text-sm text-muted-foreground">
                  If you are not redirected automatically,{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    click here to sign in
                  </Link>
                </p>
              ) : (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    {error.includes("expired")
                      ? "Your verification link has expired. Please request a new one."
                      : "There was a problem verifying your email. Please try again or contact support."}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="w-full"
                  >
                    Return to Login
                  </Button>
                </>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
