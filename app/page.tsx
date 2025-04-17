import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <div className="flex items-center">
          <Image
            src="/placeholder.svg?height=40&width=150&text=Milestone+Learning"
            alt="Milestone Learning Logo"
            width={150}
            height={40}
            className="h-auto w-auto"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4 text-center md:p-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#02342e] md:text-5xl lg:text-6xl">
          Welcome to Milestone Learning
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Personalized tutoring services for high-achieving students. Reach your academic goals with our expert tutors.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button size="lg" className="bg-[#095d40] hover:bg-[#02342e]" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
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
              <div className="mb-4 inline-block rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
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
              <div className="mb-4 inline-block rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
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
              <div className="mb-4 inline-block rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
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
