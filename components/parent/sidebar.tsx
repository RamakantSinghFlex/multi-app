"use client"

import { useAuth } from "@/lib/auth-context"
import { CollapsibleSidebar } from "@/components/ui/collapsible-sidebar"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { handleLogout } from "@/lib/utils/auth-utils"

export default function ParentSidebar() {
  const { logout } = useAuth()

  // Remove the Sessions menu item from the sections array
  const sections = [
    {
      title: "Main",
      items: [
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
      ],
    },
    {
      title: "Support",
      items: [
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
      ],
    },
  ]

  const logo = (
    <Image
      src="/placeholder.svg?height=32&width=120&text=Milestone"
      alt="Milestone Learning"
      width={120}
      height={32}
      className="h-8 w-auto"
    />
  )

  const footer = (
    <Button
      variant="ghost"
      className="w-full justify-start text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={() => handleLogout(logout)}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign out</span>
    </Button>
  )

  return <CollapsibleSidebar sections={sections} logo={logo} footer={footer} />
}
