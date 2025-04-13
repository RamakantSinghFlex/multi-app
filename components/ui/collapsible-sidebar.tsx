"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ElementType
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

interface CollapsibleSidebarProps {
  sections: SidebarSection[]
  footer?: React.ReactNode
  logo?: React.ReactNode
}

export function CollapsibleSidebar({ sections, footer, logo }: CollapsibleSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }
  }, [])

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(collapsed))
  }, [collapsed])

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3 py-2">
        {!collapsed && <div className="flex-1 overflow-hidden">{logo}</div>}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        {sections.map((section, index) => (
          <div key={index} className="px-3 py-2">
            {!collapsed && (
              <h3 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return collapsed ? (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-md",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-9 items-center rounded-md px-3 text-sm",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {footer && <div className={cn("border-t p-3", collapsed ? "items-center justify-center" : "")}>{footer}</div>}
    </div>
  )
}
