"use client"

import type React from "react"
import { useSidebar } from "@/hooks/use-sidebar"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export function ResponsiveLayout({ sidebar, header, children }: ResponsiveLayoutProps) {
  const { isCollapsed, collapseSidebar } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col bg-sidebar-background transition-all duration-300 ease-in-out md:relative",
          isCollapsed ? "w-[70px]" : "w-[250px]",
        )}
      >
        {sidebar}
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-[70px]" : "ml-[250px]",
          "md:ml-0", // On medium screens and up, we use the relative positioning
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background">{header}</div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => collapseSidebar()} />}
    </div>
  )
}
