"use client"

import type React from "react"

import { SidebarProvider } from "@/hooks/use-sidebar"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { BaseSidebar, SidebarSection, SidebarItem } from "@/components/base-sidebar"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Home, Book, Calendar, MessageSquare, Settings } from "lucide-react"

interface ProtectedLayoutExampleProps {
  children: React.ReactNode
}

export function ProtectedLayoutExample({ children }: ProtectedLayoutExampleProps) {
  return (
    <SidebarProvider>
      <ResponsiveLayout
        sidebar={
          <BaseSidebar>
            <SidebarSection className="py-6">
              <div className="flex h-10 items-center justify-center">
                <span className="text-xl font-bold">ML</span>
              </div>
            </SidebarSection>
            <SidebarSection>
              <SidebarItem icon={<Home />} label="Dashboard" isActive />
              <SidebarItem icon={<Book />} label="Materials" />
              <SidebarItem icon={<Calendar />} label="Appointments" />
              <SidebarItem icon={<MessageSquare />} label="Messages" />
              <SidebarItem icon={<Settings />} label="Settings" />
            </SidebarSection>
          </BaseSidebar>
        }
        header={
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <SidebarToggle />
              <h1 className="ml-4 text-xl font-semibold">Dashboard</h1>
            </div>
            <div>
              {/* User profile or other header elements */}
              <span className="rounded-full bg-muted p-2">User</span>
            </div>
          </div>
        }
      >
        {children}
      </ResponsiveLayout>
    </SidebarProvider>
  )
}
