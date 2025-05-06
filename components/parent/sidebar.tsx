"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import {
  Home,
  Users,
  Calendar,
  HelpCircle,
  BookOpen,
  LogOut,
  FolderArchive,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { handleLogout } from "@/lib/utils/auth-utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ParentSidebar() {
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }

    // Initialize main content padding based on initial collapsed state
    updateMainContentPadding(savedState === "true")
  }, [])

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed))
    updateMainContentPadding(collapsed)
  }, [collapsed])

  // Function to update main content padding
  const updateMainContentPadding = (isCollapsed: boolean) => {
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      if (isCollapsed) {
        mainContent.style.paddingLeft = "96px" // 6rem or 16 * 6px
      } else {
        mainContent.style.paddingLeft = "256px" // 16rem or 16 * 16px
      }
    }
  }

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/parent/dashboard",
      icon: Home,
    },
    {
      title: "Child Profile",
      href: "/parent/profile",
      icon: Users,
    },
    {
      title: "Subjects",
      href: "/parent/subjects",
      icon: BookOpen,
    },
    {
      title: "Bookings",
      href: "/parent/bookings",
      icon: Calendar,
    },
    {
      title: "Docu Vault",
      href: "/parent/documents",
      icon: FolderArchive,
    },
    {
      title: "Resources",
      href: "/parent/resources",
      icon: Layers,
    },
    {
      title: "Support",
      href: "/parent/help",
      icon: HelpCircle,
    },
  ]

  return (
    <div
      className={cn(
        "h-screen border-r border-[#e8e8e8] bg-white transition-all duration-300 sidebar-transition",
        collapsed ? "w-24" : "w-64"
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#545454]"
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-col h-[calc(100vh-64px)] justify-between overflow-y-auto">
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
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 mb-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full rounded-lg py-2 px-3 text-sm text-[#545454] hover:bg-[#f4f4f4] hover:text-[#333333]",
              collapsed ? "justify-center" : "justify-start"
            )}
            onClick={() => handleLogout(logout)}
          >
            <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
