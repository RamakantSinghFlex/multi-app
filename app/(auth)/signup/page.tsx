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
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ErrorModal, parseApiError, type ApiError } from "@/components/ui/error-modal"
import { logger } from "@/lib/monitoring"
import { FEATURES } from "@/lib/config"
// Import the shared PasswordInput component
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "sonner"

export default function SignupPage() {
  const {
    signup,
    isLoading,
    error,
    successMessage,
    resetAuthError,
    clearSuccessMessage,
    isAuthenticated,
    user,
    setError,
  } = useAuth()

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"parent" | "tutor">("parent")
  const [terms, setTerms] = useState(false)

  // UI state
  const [apiErrors, setApiErrors] = useState<ApiError[] | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

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
            // Default fallback if role doesn't match expected values
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
    const errors: {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
      confirmPassword?: string
      terms?: string
    } = {}

    if (!firstName) {
      errors.firstName = "First name is required"
    }

    if (!lastName) {
      errors.lastName = "Last name is required"
    }

    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!password) {
      errors.password = "Password is required"
    } else {
      const PASSWORD_MIN_LENGTH = 8
      const PASSWORD_REQUIRES_UPPERCASE = true
      const PASSWORD_REQUIRES_LOWERCASE = true
      const PASSWORD_REQUIRES_NUMBER = true
      const PASSWORD_REQUIRES_SPECIAL = false

      if (password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      } else if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.password = "Password must contain at least one uppercase letter"
      } else if (PASSWORD_REQUIRES_LOWERCASE && !/[a-z]/.test(password)) {
        errors.password = "Password must contain at least one lowercase letter"
      } else if (PASSWORD_REQUIRES_NUMBER && !/[0-9]/.test(password)) {
        errors.password = "Password must contain at least one number"
      } else if (PASSWORD_REQUIRES_SPECIAL && !/[^A-Za-z0-9]/.test(password)) {
        errors.password = "Password must contain at least one special character"
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match"
    }

    if (!terms) {
      errors.terms = "You must agree to the terms and conditions"
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

    if (error) resetAuthError()

    // Prevent double submission
    if (isSubmitting) return
    setIsSubmitting(true)

    const formData = {
      firstName,
      lastName,
      email,
      password,
      roles: [role], // Use an array for roles
    }

    try {
      const response = await signup(formData)

      if (response && !response.error) {
        // Show a success message about email verification
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account before logging in.",
        })

        // Redirect to login page after signup
        router.push("/login")
      }
    } catch (err) {
      logger.error("Unhandled signup error:", err)

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
    } finally {
      setIsSubmitting(false)
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
          priority
        />
      </div>

      <Card className="w-full max-w-md border-0 shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading || isSubmitting}
                  className="border-input focus:border-primary focus:ring-primary"
                  autoComplete="given-name"
                />
                {validationErrors.firstName && (
                  <p className="text-sm font-medium text-destructive">{validationErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading || isSubmitting}
                  className="border-input focus:border-primary focus:ring-primary"
                  autoComplete="family-name"
                />
                {validationErrors.lastName && (
                  <p className="text-sm font-medium text-destructive">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isSubmitting}
                className="border-input focus:border-primary focus:ring-primary"
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="text-sm font-medium text-destructive">{validationErrors.email}</p>
              )}
            </div>

            {/* Use the shared PasswordInput component */}
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              onGeneratePassword={setConfirmPassword}
              disabled={isLoading || isSubmitting}
              label="Password"
              showStrengthIndicator={true}
              autoComplete="new-password"
              required={true}
              error={validationErrors.password}
            />

            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={isLoading || isSubmitting}
              label="Confirm password"
              autoComplete="new-password"
              showGenerateButton={false}
              required={true}
              error={validationErrors.confirmPassword}
            />

            <div className="space-y-3">
              <Label>I am a</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as "parent" | "tutor")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent" className="font-normal">
                    Parent
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="tutor" id="tutor" />
                  <Label htmlFor="tutor" className="font-normal">
                    Tutor
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={(checked) => setTerms(checked === true)}
                disabled={isLoading || isSubmitting}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="terms">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </Label>
                {validationErrors.terms && (
                  <p className="text-sm font-medium text-destructive">{validationErrors.terms}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading || isSubmitting} className="w-full">
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
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
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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
                Sign up with Google
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>

      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        errors={apiErrors}
        title="Signup Error"
        description="There was a problem creating your account."
      />
    </div>
  )
}
