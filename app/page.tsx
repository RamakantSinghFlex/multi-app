"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/monitoring"

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  // Additional check for valid authentication with proper optional chaining
  const isReallyAuthenticated =
    isAuthenticated && user && user.roles && Array.isArray(user.roles) && user.roles?.length > 0

  useEffect(() => {
    if (!isLoading) {
      logger.info("Home page: Auth check complete", {
        isAuthenticated: isAuthenticated,
        user: user,
        hasRoles: user?.roles && Array.isArray(user?.roles) ? user.roles?.length > 0 : false,
      })
      setPageLoading(false)
    }
  }, [isLoading, isAuthenticated, user])

  // If there's an error during navigation
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="text-destructive">
          <p className="text-lg font-semibold">Navigation Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  // Show a loading state while checking authentication
  if (pageLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    )
  }

  // Landing page content
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - No dashboard button here */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border bg-card px-4 md:px-6 lg:px-10">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#02342e]">Milestone</span>
            <span className="mx-2 text-2xl text-[#02342e]">|</span>
            <span className="text-2xl text-[#02342e]">Learning</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/about-us" className="text-base font-medium text-[#02342e] hover:text-[#095d40]">
            About Us
          </Link>
          <Link href="/what-we-do" className="text-base font-medium text-[#02342e] hover:text-[#095d40]">
            What We Do
          </Link>
          <Link href="/resources" className="text-base font-medium text-[#02342e] hover:text-[#095d40]">
            Resources
          </Link>
          <Link href="/contact-us" className="text-base font-medium text-[#02342e] hover:text-[#095d40]">
            Contact Us
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="rounded-full border-[#02342e] text-[#02342e] hover:bg-[#f5f5f5] px-6"
            asChild
          >
            <Link href="/book-session">Book A Session</Link>
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-[#02342e] hover:bg-[#f5f5f5] flex items-center gap-2"
            asChild
          >
            <Link href="/login">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-user"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero section - Dashboard button only here if truly authenticated */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4 text-center md:p-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#02342e] md:text-5xl lg:text-6xl">
          Welcome to Milestone Learning
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Personalized tutoring services for high-achieving students. Reach your academic goals with our expert tutors.
        </p>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          {isReallyAuthenticated ? (
            // Only show dashboard button for actually authenticated users with roles
            <Button size="lg" className="bg-[#095d40] hover:bg-[#02342e]" asChild>
              <Link href={`/${user?.roles?.[0] || "dashboard"}/dashboard`}>Go to Dashboard</Link>
            </Button>
          ) : (
            // Show these buttons for non-authenticated users
            <>
              <Button size="lg" className="bg-[#095d40] hover:bg-[#02342e]" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features section */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-[#02342e] md:text-4xl">
            Why Choose Milestone Learning
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 rounded-full bg-[#eaf4ed] p-3 text-[#095d40] inline-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#02342e]">Expert Tutors</h3>
              <p className="text-muted-foreground">
                Our tutors are subject matter experts with proven track records of student success.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 rounded-full bg-[#eaf4ed] p-3 text-[#095d40] inline-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#02342e]">Personalized Learning</h3>
              <p className="text-muted-foreground">
                Customized learning plans tailored to each student's unique needs and goals.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 rounded-full bg-[#eaf4ed] p-3 text-[#095d40] inline-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 7h-9"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#02342e]">Flexible Scheduling</h3>
              <p className="text-muted-foreground">
                Book sessions at times that work for you, with both in-person and virtual options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Milestone Learning. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
