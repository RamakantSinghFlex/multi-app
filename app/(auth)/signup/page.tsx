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
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Update the imports to include the googleSignIn function
import { googleSignIn } from "@/lib/api/auth"

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
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
            console.log("User already authenticated, redirecting...")

            // Check if there's a redirect path
            if (redirectPath) {
                router.push(redirectPath)
            } else {
                // Redirect based on user role
                if (user.role === "admin") {
                    router.push("/admin/dashboard")
                } else if (user.role === "parent") {
                    router.push("/parent/dashboard")
                } else if (user.role === "tutor") {
                    router.push("/tutor/dashboard")
                } else if (user.role === "student") {
                    router.push("/student/dashboard")
                } else {
                    router.push("/dashboard")
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

        try {
            await signup({
                firstName,
                lastName,
                email,
                password,
                roles: [role],
            })

            // Redirection is handled by the useEffect above
        } catch (err) {
            console.error("Unhandled signup error:", err)
            // The error will be handled by the auth context
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
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>Enter your information to get started</CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600"/>
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form fields remain the same */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={isLoading}
                                    className="border-input focus:border-primary focus:ring-primary"
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
                                    disabled={isLoading}
                                    className="border-input focus:border-primary focus:ring-primary"
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
                                disabled={isLoading}
                                className="border-input focus:border-primary focus:ring-primary"
                            />
                            {validationErrors.email && (
                                <p className="text-sm font-medium text-destructive">{validationErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="border-input focus:border-primary focus:ring-primary"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </Button>
                            </div>
                            {validationErrors.confirmPassword && (
                                <p className="text-sm font-medium text-destructive">{validationErrors.confirmPassword}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label>I am a</Label>
                            <RadioGroup
                                value={role}
                                onValueChange={(value) => setRole(value as "parent" | "tutor")}
                                className="flex flex-col space-y-1"
                            >
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="parent" id="parent"/>
                                    <Label htmlFor="parent" className="font-normal">
                                        Parent
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="tutor" id="tutor"/>
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
                                disabled={isLoading}
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

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>

                    <div className="relative mt-6 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full"/>
                        </div>
                        <span className="relative bg-card px-2 text-xs text-muted-foreground">Or continue with</span>
                    </div>

                    {/* Update the button in the "Or continue with" section */}
                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-input"
                            disabled={isLoading}
                            onClick={() => {
                                try {
                                    googleSignIn()
                                } catch (err) {
                                    console.error("Google sign-in error:", err)
                                    setError("Failed to initiate Google sign-in. Please try again.")
                                }
                            }}
                        >
                            <svg className="mr-2 h-5 w-5 text-[#4285f4]" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                            </svg>
                            Sign up with Google
                        </Button>
                    </div>
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
        </div>
    )
}

