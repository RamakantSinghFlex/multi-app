"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { PhoneCall, User } from "lucide-react"
import { useEffect, useState } from "react"
import { logger } from "@/lib/monitoring"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function Navbar({ data }: { data: any }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)
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
              src={data.logo.url}
              alt={data.logo.alt}
              width={150}
              height={32}
              className="h-8"
            />
          </Link>
        </div>
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="hidden md:flex !border-green-900 !text-green-900 rounded-full cursor-pointer"
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            <span>{data.contactPhone}</span>
          </Button>
          <Button
            className="bg-primary text-white !px-8 rounded-full cursor-pointer"
            onClick={handleAuth}
            disabled={isLoading || pageLoading}
          >
            <User />
            {isLoading || pageLoading
              ? "Loading..."
              : isReallyAuthenticated
                ? "Logout"
                : "Login"}
          </Button>
        </div>
      </div>
    </header>
  )
}
