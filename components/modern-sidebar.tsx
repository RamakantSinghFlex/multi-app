"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
  BookOpen,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

interface SidebarProps {
  role: "parent" | "tutor" | "admin" | "student"
}

export default function ModernSidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Get main nav items based on role
  const getMainNavItems = (): NavItem[] => {
    const commonItems = [
      {
        title: "Dashboard",
        href: `/${role}/dashboard`,
        icon: Home,
      },
      {
        title: "Appointments",
        href: `/${role}/appointments`,
        icon: Calendar,
      },
      {
        title: "Messages",
        href: `/${role}/messages`,
        icon: MessageSquare,
      },
    ]

    // Add role-specific items
    if (role === "student") {
      return [
        ...commonItems,
        {
          title: "Materials",
          href: `/${role}/materials`,
          icon: BookOpen,
        },
        {
          title: "Documents",
          href: `/${role}/documents`,
          icon: FileText,
        },
        {
          title: "Progress",
          href: `/${role}/progress`,
          icon: CreditCard,
        },
      ]
    } else if (role === "parent") {
      return [
        ...commonItems,
        {
          title: "Students",
          href: `/${role}/students`,
          icon: Users,
        },
        {
          title: "Billing",
          href: `/${role}/billing`,
          icon: CreditCard,
        },
      ]
    } else if (role === "tutor") {
      return [
        ...commonItems,
        {
          title: "Students",
          href: `/${role}/students`,
          icon: Users,
        },
        {
          title: "Materials",
          href: `/${role}/materials`,
          icon: BookOpen,
        },
        {
          title: "Documents",
          href: `/${role}/documents`,
          icon: FileText,
        },
      ]
    } else if (role === "admin") {
      return [
        ...commonItems,
        {
          title: "Users",
          href: `/${role}/users`,
          icon: Users,
        },
        {
          title: "Reports",
          href: `/${role}/reports`,
          icon: FileText,
        },
      ]
    }

    return commonItems
  }

  const supportNavItems: NavItem[] = [
    {
      title: "Settings",
      href: `/${role}/settings`,
      icon: Settings,
    },
    {
      title: "Help",
      href: `/${role}/help`,
      icon: HelpCircle,
    },
  ]

  const mainNavItems = getMainNavItems()

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed")
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === "true")
    }

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed.toString())
  }, [collapsed])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeMobileSidebar = () => {
    setIsOpen(false)
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href

    return (
      <TooltipProvider key={item.href} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={isMobile ? closeMobileSidebar : undefined}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                collapsed ? "justify-center px-2" : "justify-start",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Mobile sidebar toggle button
  const mobileToggle = (
    <Button variant="outline" size="icon" className="fixed left-4 top-4 z-50 lg:hidden" onClick={toggleMobileSidebar}>
      <Menu className="h-5 w-5" />
    </Button>
  )

  // Sidebar content
  const sidebarContent = (
    <>
      <div className={cn("flex items-center", collapsed ? "justify-center p-2" : "justify-between p-4", "border-b")}>
        {!collapsed && (
          <Link href={`/${role}/dashboard`} className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=30&width=30&text=ML"
              alt="Logo"
              width={30}
              height={30}
              className="rounded-md"
            />
            <span className="font-semibold">Milestone</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn("h-8 w-8", collapsed && "mx-auto")}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>{mainNavItems.map(renderNavItem)}</nav>

        <div className={cn("mt-6", collapsed ? "px-2" : "px-4")}>
          {!collapsed && (
            <h3 className="px-2 text-xs font-medium uppercase text-muted-foreground tracking-wider">Support</h3>
          )}
        </div>
        <nav className={cn("mt-2 space-y-1", collapsed ? "px-2" : "px-3")}>
          {supportNavItems.map(renderNavItem)}

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => logout()}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors",
                    collapsed ? "justify-center px-2" : "justify-start",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <LogOut className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && <span>Sign out</span>}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Sign out</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>

      {!collapsed && user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user.firstName ? user.firstName[0] : user.email ? user.email[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      {mobileToggle}

      {/* Desktop sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden border-r bg-background transition-all duration-300 lg:flex lg:flex-col",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      {isMobile && (
        <>
          <div
            className={cn(
              "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-all duration-300 lg:hidden",
              isOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            onClick={closeMobileSidebar}
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 border-r bg-background transition-transform duration-300 lg:hidden",
              isOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
