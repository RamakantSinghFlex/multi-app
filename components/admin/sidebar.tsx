"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
  BarChart,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { handleLogout } from "@/lib/utils/auth-utils"

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Appointments",
      href: "/admin/appointments",
      icon: Calendar,
    },
    {
      title: "Tutors",
      href: "/admin/tutors",
      icon: BookOpen,
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: MessageSquare,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
  ]

  const bottomNavItems = [
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Help & Support",
      href: "/admin/help",
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
          <Link href="/admin/students" onClick={closeSidebar}>
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
                        ? "bg-secondary text-secondary-foreground"
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
              onClick={() => handleLogout(logout)}
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
