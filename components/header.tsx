"use client"
import { Bell, Search, User } from "lucide-react"
import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  // Determine which header title to show based on the path
  let headerTitle = "Dashboard"
  if (pathname.includes("/settings")) {
    headerTitle = "Settings"
  } else if (pathname.includes("/materials")) {
    headerTitle = "Learning Materials"
  } else if (pathname.includes("/messages")) {
    headerTitle = "Messages"
  } else if (pathname.includes("/appointments")) {
    headerTitle = "Appointments"
  } else if (pathname.includes("/documents")) {
    headerTitle = "Documents"
  } else if (pathname.includes("/sessions")) {
    headerTitle = "Sessions"
  } else if (pathname.includes("/help")) {
    headerTitle = "Help & Support"
  } else if (pathname.includes("/students")) {
    headerTitle = "Students"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e8e8e8] bg-white px-4 md:px-6">
      <div className="flex flex-1 items-center md:ml-0">
        <h1 className="text-xl font-bold text-[#1d1b20]">{headerTitle}</h1>
        <form onSubmit={handleSearch} className="relative ml-6 hidden md:block md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#858585]" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-md border-[#dbdbdb] pl-8 focus:border-[#095d40] focus:ring-[#095d40]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="rounded-full text-[#545454] hover:bg-[#efefef]">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-[#545454] hover:bg-[#efefef]">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user && (
              <DropdownMenuItem className="flex flex-col items-start">
                <span className="font-medium">
                  {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email}
                </span>
                <span className="text-xs text-[#858585]">{user.email}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
