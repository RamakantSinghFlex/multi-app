"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { Menu, PhoneCall, User } from "lucide-react"
import { useEffect, useState } from "react"
import { logger } from "@/lib/monitoring"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar({ data }: { data: any }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Additional check for valid authentication with proper optional chaining
  const isReallyAuthenticated =
    isAuthenticated &&
    user &&
    user.roles &&
    Array.isArray(user.roles) &&
    user.roles?.length > 0

  // Handle auth
  const handleAuth = () => {
    if (isReallyAuthenticated) {
      logout()
    } else {
      router.push("login")
    }
  }

  useEffect(() => {
    if (!isLoading) {
      logger.info("Home page: Auth check complete", {
        isAuthenticated: isAuthenticated,
        user: user,
        hasRoles:
          user?.roles && Array.isArray(user?.roles)
            ? user.roles?.length > 0
            : false,
      })
      setPageLoading(false)
    }
  }, [isLoading, isAuthenticated, user])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow">
      <div className="w-full flex h-16 items-center justify-between mx-auto px-4 md:px-16">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Image
              src={data.logo.url || "/placeholder.svg"}
              alt={data.logo.alt}
              width={150}
              height={32}
              className="h-8"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-black">
          {data.navigationLinks.map((link: any) => (
            <Link
              key={link.id}
              href={link.url}
              className="text-sm font-medium hover:text-green-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="outline"
            className="!border-green-900 !text-green-900 rounded-full cursor-pointer"
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            <span>{data.contactPhone}</span>
          </Button>
          <Button
            className="bg-primary text-white !px-8 rounded-full cursor-pointer"
            onClick={handleAuth}
            disabled={isLoading || pageLoading}
          >
            <User className="mr-2 h-4 w-4" />
            {isLoading || pageLoading
              ? "Loading..."
              : isReallyAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Call"
          >
            <PhoneCall className="h-5 w-5 text-green-900" />
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px] pt-6">
              <div className="flex flex-col gap-6 mt-4">
                <nav className="flex flex-col gap-4">
                  {data.navigationLinks.map((link: any) => (
                    <Link
                      key={link.id}
                      href={link.url}
                      className="text-base font-medium hover:text-green-700 py-2 border-b border-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-4">
                  <Button
                    className="w-full bg-primary text-white rounded-full cursor-pointer"
                    onClick={() => {
                      handleAuth()
                      setIsOpen(false)
                    }}
                    disabled={isLoading || pageLoading}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {isLoading || pageLoading
                      ? "Loading..."
                      : isReallyAuthenticated
                        ? "Logout"
                        : "Login"}
                  </Button>
                </div>

                <div className="mt-2">
                  <Button
                    variant="outline"
                    className="w-full !border-green-900 !text-green-900 rounded-full cursor-pointer"
                  >
                    <PhoneCall className="mr-2 h-4 w-4" />
                    <span>{data.contactPhone}</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
