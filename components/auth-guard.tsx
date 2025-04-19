/**
 * Authentication Guard Component
 *
 * This component protects routes by checking authentication status and user roles.
 * It redirects unauthenticated users to the login page and users without proper roles
 * to their appropriate dashboard.
 */

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/monitoring"
import { Button } from "@/components/ui/button"

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/role-selection",
  "/terms",
  "/privacy",
]

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function AuthGuard({ children, allowedRoles = [] }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for public routes
    const isPublicRoute =
      PUBLIC_ROUTES.includes(pathname) ||
      pathname.startsWith("/public") ||
      pathname.startsWith("/api/") ||
      pathname.includes("/content/")

    const checkAuthStatus = async () => {
      try {
        if (!isLoading) {
          logger.info("AuthGuard checking access", {
            pathname,
            isAuthenticated,
            isPublicRoute,
            userRoles: user?.roles || [],
            allowedRoles,
          })

          // Only redirect to login if not authenticated and on a protected route
          if (!isAuthenticated && !isPublicRoute) {
            logger.info("Not authenticated, redirecting to login", { pathname })
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
            return
          }

          // Only redirect if user doesn't have the required role for a specific protected route
          if (isAuthenticated && allowedRoles.length > 0 && user) {
            // Get user roles from roles array
            const userRoles = user.roles || []

            // Check if any of the user's roles match the allowed roles
            const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role))

            if (!hasAllowedRole) {
              logger.info("User doesn't have required role, redirecting to appropriate dashboard", {
                userRoles,
                allowedRoles,
              })

              // Redirect based on the user's first role
              const primaryRole = userRoles[0]

              if (primaryRole === "admin") {
                router.push("/admin/dashboard")
              } else if (primaryRole === "parent") {
                router.push("/parent/dashboard")
              } else if (primaryRole === "tutor") {
                router.push("/tutor/dashboard")
              } else if (primaryRole === "student") {
                router.push("/student/dashboard")
              } else {
                router.push("/dashboard")
              }
              return
            }
          }

          setIsChecking(false)
        }
      } catch (err) {
        logger.error("Auth check error:", err)
        setError("Authentication check failed. Please try refreshing the page.")
        setIsChecking(false)
      }
    }

    checkAuthStatus()
  }, [isAuthenticated, isLoading, pathname, router, user, allowedRoles])

  // Function to retry authentication
  const handleRetry = async () => {
    setError(null)
    setIsChecking(true)
    try {
      await checkAuth()
      setIsChecking(false)
    } catch (err) {
      logger.error("Retry auth check error:", err)
      setError("Authentication check failed again. Please try refreshing the page.")
      setIsChecking(false)
    }
  }

  // If there's an error during auth check
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // For public routes, or when authenticated on protected routes with correct role
  return <>{children}</>
}
