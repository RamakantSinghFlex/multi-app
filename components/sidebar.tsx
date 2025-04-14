"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, BookOpen, Calendar, MessageSquare, FileText, Settings, HelpCircle, Menu, X, LogOut } from "lucide-react"
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

  // Determine which sidebar items to show based on the path
  const isStudent = pathname.includes("/student")
  const isParent = pathname.includes("/parent")
  const isAdmin = pathname.includes("/admin")
  const isTutor = pathname.includes("/tutor")

  let mainNavItems = []
  let basePath = ""

  if (isStudent) {
    basePath = "/student"
    mainNavItems = [
      {
        title: "Dashboard",
        href: "/student/dashboard",
        icon: Home,
      },
      {
        title: "Sessions",
        href: "/student/sessions",
        icon: Calendar,
      },
      {
        title: "Appointments",
        href: "/student/appointments",
        icon: Calendar,
      },
      {
        title: "Learning Materials",
        href: "/student/materials",
        icon: BookOpen,
      },
      {
        title: "Messages",
        href: "/student/messages",
        icon: MessageSquare,
      },
      {
        title: "Documents",
        href: "/student/documents",
        icon: FileText,
      },
    ]
  } else if (isParent) {
    basePath = "/parent"
    mainNavItems = [
      {
        title: "Dashboard",
        href: "/parent/dashboard",
        icon: Home,
      },
      {
        title: "Students",
        href: "/parent/students",
        icon: Home,
      },
      {
        title: "Appointments",
        href: "/parent/appointments",
        icon: Calendar,
      },
      {
        title: "Messages",
        href: "/parent/messages",
        icon: MessageSquare,
      },
      {
        title: "Materials",
        href: "/parent/materials",
        icon: BookOpen,
      },
      {
        title: "Documents",
        href: "/parent/documents",
        icon: FileText,
      },
    ]
  } else if (isAdmin) {
    basePath = "/admin"
    mainNavItems = [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: Home,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Home,
      },
      {
        title: "Sessions",
        href: "/admin/sessions",
        icon: Calendar,
      },
      {
        title: "Messages",
        href: "/admin/messages",
        icon: MessageSquare,
      },
    ]
  } else if (isTutor) {
    basePath = "/tutor"
    mainNavItems = [
      {
        title: "Dashboard",
        href: "/tutor/dashboard",
        icon: Home,
      },
      {
        title: "Students",
        href: "/tutor/students",
        icon: Home,
      },
      {
        title: "Appointments",
        href: "/tutor/appointments",
        icon: Calendar,
      },
      {
        title: "Messages",
        href: "/tutor/messages",
        icon: MessageSquare,
      },
      {
        title: "Materials",
        href: "/tutor/materials",
        icon: BookOpen,
      },
      {
        title: "Documents",
        href: "/tutor/documents",
        icon: FileText,
      },
    ]
  } else {
    // Default sidebar
    basePath = "/dashboard"
    mainNavItems = [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        title: "Sessions",
        href: "/sessions",
        icon: Calendar,
      },
      {
        title: "Materials",
        href: "/materials",
        icon: BookOpen,
      },
      {
        title: "Messages",
        href: "/messages",
        icon: MessageSquare,
      },
    ]
  }

  const bottomNavItems = [
    {
      title: "Settings",
      href: `${basePath}/settings`,
      icon: Settings,
    },
    {
      title: "Help & Support",
      href: `${basePath}/help`,
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
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#f4f4f4] shadow-md transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[#e8e8e8] bg-white px-4">
          <Link href={`${basePath}/dashboard`} onClick={closeSidebar}>
            <Image
              src="/placeholder.svg?height=40&width=150&text=Milestone+Learning"
              alt="Milestone Learning Logo"
              width={150}
              height={40}
              className="h-auto w-auto"
            />
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
            <X className="h-5 w-5 text-[#095d40]" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-medium uppercase text-[#858585]">Main</h3>
              <nav className="space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      pathname === item.href
                        ? "bg-[#e3fae3] text-[#095d40]"
                        : "text-[#545454] hover:bg-[#efefef] hover:text-[#095d40]",
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

        <div className="border-t border-[#e8e8e8] bg-white p-4">
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-[#e3fae3] text-[#095d40]"
                    : "text-[#545454] hover:bg-[#efefef] hover:text-[#095d40]",
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.title}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium text-[#545454] hover:bg-[#efefef] hover:text-[#095d40]"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign out
            </Button>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={closeSidebar} />}
    </>
  )
}
