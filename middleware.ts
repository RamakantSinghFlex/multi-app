import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a simplified middleware for the preview environment
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Mock authentication check - in a real app, this would verify the session
  const isAuthenticated = request.cookies.has("mock_auth_token")

  // Protected routes
  const protectedRoutes = ["/dashboard", "/student", "/tutor", "/admin", "/parent"]

  // Auth routes
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
