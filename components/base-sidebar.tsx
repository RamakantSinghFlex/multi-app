"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"

interface BaseSidebarProps {
  children: React.ReactNode
  className?: string
}

export function BaseSidebar({ children, className }: BaseSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-hidden bg-sidebar-background text-sidebar-foreground",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[250px]",
        className,
      )}
    >
      {children}
    </aside>
  )
}

interface SidebarSectionProps {
  children: React.ReactNode
  className?: string
}

export function SidebarSection({ children, className }: SidebarSectionProps) {
  return <div className={cn("px-3 py-2", className)}>{children}</div>
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export function SidebarItem({ icon, label, isActive, onClick, className }: SidebarItemProps) {
  const { isCollapsed } = useSidebar()

  return (
    <button
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium",
        "transition-colors duration-200",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        className,
      )}
      onClick={onClick}
    >
      <span className="mr-3 flex h-5 w-5 items-center justify-center">{icon}</span>
      {!isCollapsed && <span>{label}</span>}
    </button>
  )
}
