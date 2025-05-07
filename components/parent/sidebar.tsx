"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect, useCallback } from "react"
import {
  BellDot,
  LogOut,
  MessageCircleMore,
  Paperclip,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { handleLogout } from "@/lib/utils/auth-utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import dashboardIcon from "@/public/sidebar/dashboard.png"
import childProfileIcon from "@/public/sidebar/child-profile.png"
import subjectsIcon from "@/public/sidebar/subjects.png"
import bookingsIcon from "@/public/sidebar/bookings.png"
import docuVaultIcon from "@/public/sidebar/docu-vault.png"
import resourcesIcon from "@/public/sidebar/resources.png"
import supportIcon from "@/public/sidebar/support.png"
import sidebarIcon from "@/public/sidebar/sidebar.png"
import { Separator } from "@/components/ui/separator"
import { useIsSize } from "@/hooks/use-viewport"
import { BREAKPOINT_7XL } from "@/lib/utils/viewports"

interface ParentSidebarProps {
  isMobile?: boolean
}

export default function ParentSidebar({
  isMobile = false,
}: ParentSidebarProps) {
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const isQuickActions = useIsSize(BREAKPOINT_7XL)

  // Function to update main content padding
  const updateMainContentPadding = useCallback(
    (isCollapsed: boolean) => {
      if (isMobile) return // Don't adjust padding in mobile mode

      const mainContent = document.getElementById("main-content")
      if (mainContent) {
        if (isCollapsed) {
          mainContent.style.paddingLeft = "96px" // 6rem or 16 * 6px
        } else {
          mainContent.style.paddingLeft = "256px" // 16rem or 16 * 16px
        }
      }
    },
    [isMobile]
  )

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }

    // Initialize main content padding based on initial collapsed state
    updateMainContentPadding(savedState === "true")
  }, [updateMainContentPadding])

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed))
    updateMainContentPadding(collapsed)
  }, [collapsed, updateMainContentPadding])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/parent/dashboard",
      icon: dashboardIcon,
    },
    {
      title: "Child Profile",
      href: "/parent/students",
      icon: childProfileIcon,
    },
    {
      title: "Subjects",
      href: "/parent/subjects",
      icon: subjectsIcon,
    },
    {
      title: "Bookings",
      href: "/parent/appointments",
      icon: bookingsIcon,
    },
    {
      title: "Docu Vault",
      href: "/parent/documents",
      icon: docuVaultIcon,
    },
    {
      title: "Resources",
      href: "/parent/resources",
      icon: resourcesIcon,
    },
    {
      title: "Support",
      href: "/parent/help",
      icon: supportIcon,
    },
  ]

  return (
    <div
      className={cn(
        "border-r border-[#e8e8e8] bg-white transition-all duration-300 sidebar-transition",
        isMobile ? "h-full w-full border-r-0" : "h-screen",
        !isMobile && (collapsed ? "w-24" : "w-64")
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-[#e8e8e8] px-4">
        {!collapsed ? (
          <Image
            src="/placeholder.svg?height=32&width=148&text=Milestone|Learning"
            alt="Milestone Learning"
            width={148}
            height={32}
            className="h-8 w-auto"
          />
        ) : (
          <div className="h-8 w-8 flex items-center justify-center font-bold text-[#095d40] rounded">
            <Image src="/favicon.png" alt="Logo" width={32} height={32} />
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#545454]"
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <Image
                src={sidebarIcon || "/placeholder.svg"}
                alt="Sidebar Open"
                width={20}
                height={20}
                className="rotate-180"
              />
            ) : (
              <Image
                src={sidebarIcon || "/placeholder.svg"}
                alt="Sidebar Open"
                width={20}
                height={20}
              />
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col h-[calc(100vh-64px)] justify-between overflow-y-auto">
        <div className="space-y-4">
          <nav className="space-y-1 p-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg py-2 px-3 text-sm transition-colors",
                    isActive
                      ? "bg-[#e6f5ef] text-[#095d40] font-medium"
                      : "text-[#545454] hover:bg-[#f4f4f4] hover:text-[#333333]",
                    collapsed && !isMobile && "justify-center px-2"
                  )}
                >
                  <Image
                    src={item.icon || "/placeholder.svg"}
                    alt={item.title}
                    className={cn("h-5 w-5", !collapsed && "mr-3")}
                    width={20}
                    height={20}
                  />
                  {(!collapsed || isMobile) && <span>{item.title}</span>}
                </Link>
              )
            })}
          </nav>

          {isQuickActions && (
            <>
              <Separator className="my-2" />
              <div className="space-y-1 p-2">
                <h3
                  className={cn(
                    "px-3 text-xs font-medium text-[#858585] uppercase tracking-wider",
                    collapsed && !isMobile && "sr-only"
                  )}
                >
                  Quick Actions
                </h3>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full rounded-lg py-2 px-3 text-sm text-[#545454] hover:bg-[#f4f4f4] hover:text-[#333333]",
                    collapsed ? "flex justify-center" : "flex justify-start",
                    collapsed && !isMobile && "px-2"
                  )}
                >
                  <Plus className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {(!collapsed || isMobile) && <span>Add Subject</span>}
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full rounded-lg py-2 px-3 text-sm text-[#545454] hover:bg-[#f4f4f4] hover:text-[#333333]",
                    collapsed ? "flex justify-center" : "flex justify-start",
                    collapsed && !isMobile && "px-2"
                  )}
                >
                  <Paperclip className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {(!collapsed || isMobile) && <span>Upload File</span>}
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full rounded-lg py-2 px-3 text-sm text-[#545454] hover:bg-[#f4f4f4] hover:text-[#333333]",
                    collapsed ? "flex justify-center" : "flex justify-start",
                    collapsed && !isMobile && "px-2"
                  )}
                >
                  <MessageCircleMore
                    className={cn("h-5 w-5", !collapsed && "mr-3")}
                  />
                  {(!collapsed || isMobile) && <span>Messages</span>}
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full rounded-lg py-2 px-3 text-sm text-[#545454] hover:bg-[#f4f4f4] hover:text-[#333333]",
                    collapsed ? "flex justify-center" : "flex justify-start",
                    collapsed && !isMobile && "px-2"
                  )}
                >
                  <BellDot className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {(!collapsed || isMobile) && <span>Notifications</span>}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="p-2 mb-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full rounded-lg py-2 px-3 text-sm text-[#545454] hover:bg-[#f4f4f4] hover:text-[#333333]",
              collapsed && !isMobile ? "justify-center" : "justify-start"
            )}
            onClick={() => handleLogout(logout)}
          >
            <LogOut
              className={cn("h-5 w-5", (!collapsed || isMobile) && "mr-3")}
            />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
