"use client"

import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/hooks/use-sidebar"

export function SidebarToggle() {
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-md"
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
    </Button>
  )
}
