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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import {
  ErrorModal,
  parseApiError,
  type ApiError,
} from "@/components/ui/error-modal"
import { logger } from "@/lib/monitoring"
import { FEATURES } from "@/lib/config"

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
    setSuccessMessage,
  } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      logger.info("User already authenticated, redirecting...")

      // Check if there's a redirect path
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        // Redirect based on user roles
        if (user.roles && user.roles.length > 0) {
          const primaryRole = user.roles[0]

          if (primaryRole === "admin") {
            router.push("/admin")
          } else if (primaryRole === "parent") {
            router.push("/parent/dashboard")
          } else if (primaryRole === "tutor") {
            router.push("/tutor/dashboard")
          } else if (primaryRole === "student") {
            router.push("/student/dashboard")
          } else {
            router.push("/")
          }
        } else {
          logger.error("User has no roles")
          router.push("/")
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

  // Form validation
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      logger.info("Form validation failed")
      return
    }

    if (error) resetAuthError()

    logger.info("Submitting login form", { email })

    try {
      await login({
        email,
        password,
      })

      // Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("remembered_email", email)
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("remembered_email")
      }

      // The redirection will be handled by the useEffect above
    } catch (err) {
      logger.error("Unhandled login error:", err)

      // Parse and display API errors in the modal
      if (err) {
        try {
          const parsedErrors = parseApiError(err)
          setApiErrors(parsedErrors)
          setShowErrorModal(true)
        } catch (e) {
          // The error will be handled by the auth context
        }
      }
    }
  }

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rememberedEmail = localStorage.getItem("remembered_email")
      if (rememberedEmail) {
        setEmail(rememberedEmail)
        setRememberMe(true)
      }
    }
  }, [])

  // Handle OAuth errors and verification success
  useEffect(() => {
    // Check for OAuth error in URL
    const searchParams = new URLSearchParams(window.location.search)
    const oauthError = searchParams.get("error")
    const verified = searchParams.get("verified")

    if (verified === "true") {
      clearSuccessMessage() // Clear any existing messages
      setError("") // Clear any existing errors
      clearSuccessMessage() // Clear any existing success messages

      // Set a success message for verification
      setTimeout(() => {
        clearSuccessMessage()
        setSuccessMessage(
          "Your email has been verified successfully. You can now log in."
        )
      }, 100)
    }

    if (oauthError) {
      let errorMessage = "Authentication failed. Please try again."

      switch (oauthError) {
        case "invalid_state":
          errorMessage = "Security verification failed. Please try again."
          break
        case "no_code":
          errorMessage =
            "Authentication was cancelled or failed. Please try again."
          break
        case "token_exchange_failed":
          errorMessage = "Failed to complete authentication. Please try again."
          break
        case "userinfo_failed":
          errorMessage =
            "Failed to retrieve user information. Please try again."
          break
        case "auth_failed":
          errorMessage =
            "Failed to authenticate with our system. Please try again or use email login."
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
  }, [setError, clearSuccessMessage, setSuccessMessage])

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
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.includes("verify your email") ? (
                  <>
                    {error}{" "}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-destructive underline"
                      onClick={() =>
                        setError(
                          "If you didn't receive a verification email, please check your spam folder or contact support."
                        )
                      }
                    >
                      Need help?
                    </Button>
                  </>
                ) : (
                  error
                )}
              </AlertDescription>
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
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="text-sm font-medium text-destructive">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                disabled={isLoading}
                autoComplete="current-password"
                required={true}
                error={validationErrors.password}
                showGenerateButton={false}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="remember-me" className="text-sm font-normal">
                Remember my email
              </Label>
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

          {FEATURES.ENABLE_GOOGLE_AUTH && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push("/api/auth/google")
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={apiErrors}
        title="Login Error"
        description="There was a problem signing you in."
      />
    </div>
  )
}
