"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/monitoring"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function AuthGuard({ children, allowedRoles = [] }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for public routes
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"]
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/public")

    const checkAuth = async () => {
      try {
        if (!isLoading) {
          logger.info("AuthGuard checking access", {
            pathname,
            isAuthenticated,
            isPublicRoute,
            userRoles: user?.roles,
            allowedRoles,
          })

          // Only redirect to login if not authenticated and on a protected route
          if (!isAuthenticated && !isPublicRoute) {
            logger.info("Not authenticated, redirecting to login", { pathname })
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
            return
          }

          // Only redirect if user doesn't have the required role for a specific protected route
          if (isAuthenticated && allowedRoles.length > 0 && user && user.roles) {
            // Check if any of the user's roles match the allowed roles
            const hasAllowedRole = user.roles.some((role) => allowedRoles.includes(role))

            if (!hasAllowedRole) {
              logger.info("User doesn't have required role, redirecting to appropriate dashboard", {
                userRoles: user.roles,
                allowedRoles,
              })

              // Redirect based on the user's first role
              const primaryRole = user.roles[0]

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

    checkAuth()
  }, [isAuthenticated, isLoading, pathname, router, user, allowedRoles])

  // If there's an error during auth check
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  // For public routes, or when authenticated on protected routes with correct role
  return <>{children}</>
}
