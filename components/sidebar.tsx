"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, BookOpen, Calendar, Users, Settings, HelpCircle, Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeSidebar()
  }

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Courses",
      href: "/courses",
      icon: BookOpen,
    },
    {
      title: "Schedule",
      href: "/schedule",
      icon: Calendar,
    },
    {
      title: "Community",
      href: "/community",
      icon: Users,
    },
  ]

  const bottomNavItems = [
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Help & Support",
      href: "/help",
      icon: HelpCircle,
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-50 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-border bg-card"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5 text-primary" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-card shadow-md transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" onClick={closeSidebar}>
            <Image
              src="/placeholder.svg?height=40&width=150&text=Milestone+Learning"
              alt="Milestone Learning Logo"
              width={150}
              height={40}
              className="h-auto w-auto"
            />
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
            <X className="h-5 w-5 text-primary" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-medium uppercase text-muted-foreground">Main</h3>
              <nav className="space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted hover:text-primary",
                    )}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4">
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground hover:bg-muted hover:text-primary",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.title}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted hover:text-primary"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign out
            </Button>
          </nav>
        </div>

        {user && (
          <div className="border-t border-border p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                {user.firstName && user.firstName.length > 0
                  ? user.firstName[0]
                  : user.email && user.email.length > 0
                    ? user.email[0].toUpperCase()
                    : "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground">{user.role || "User"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={closeSidebar} />}
    </>
  )
}
