"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function AuthGuard({ children, allowedRoles = [] }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for public routes
    const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"]
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/public")

    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and not on a public route
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (isAuthenticated && isPublicRoute) {
        // Redirect to dashboard if authenticated and on a public route
        if (user?.role === "admin") {
          router.push("/admin/dashboard")
        } else if (user?.role === "parent") {
          router.push("/parent/dashboard")
        } else if (user?.role === "tutor") {
          router.push("/tutor/dashboard")
        } else if (user?.role === "student") {
          router.push("/student/dashboard")
        } else {
          router.push("/dashboard")
        }
      } else if (isAuthenticated && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if user doesn't have the required role
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
      setIsChecking(false)
    }
  }, [isAuthenticated, isLoading, pathname, router, user, allowedRoles])

  if (isLoading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // For public routes, or when authenticated on protected routes with correct role
  return <>{children}</>
}

