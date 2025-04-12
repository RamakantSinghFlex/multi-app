"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Calendar,
  Home,
  MessageSquare,
  Settings,
  Users,
  FileText,
  HelpCircle,
  CreditCard,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function ParentSidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/parent/dashboard",
      icon: Home,
    },
    {
      title: "Students",
      href: "/parent/students",
      icon: Users,
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
    {
      title: "Billing",
      href: "/parent/billing",
      icon: CreditCard,
    },
  ]

  const secondaryNavItems = [
    {
      title: "Settings",
      href: "/parent/settings",
      icon: Settings,
    },
    {
      title: "Help",
      href: "/parent/help",
      icon: HelpCircle,
    },
  ]

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Main Menu</h2>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Support</h2>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
