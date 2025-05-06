"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, MessageCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function ParentHeader() {
  const { user, logout } = useAuth()

  // Determine the settings path based on user role
  const getSettingsPath = () => {
    if (user?.roles?.includes("student")) return "/student/settings"
    if (user?.roles?.includes("tutor")) return "/tutor/settings"
    if (user?.roles?.includes("parent")) return "/parent/settings"
    if (user?.roles?.includes("admin")) return "/admin/settings"
    return "/settings"
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E6E6E6] bg-[#F4F4F4]/80 backdrop-blur-[10px] px-6 sticky top-0 z-30 w-full">
      <div>
        <h1 className="text-2xl font-medium">Good Morning Leena!</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="bg-white border-primary text-primary hover:bg-white hover:text-primary rounded-full gap-2 px-6"
        >
          Add Subject <Plus size={16} />
        </Button>
        <Button
          variant="outline"
          className="bg-white border-primary text-primary hover:bg-white hover:text-primary rounded-full gap-2 px-6"
        >
          Upload File <Plus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground rounded-full"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground rounded-full"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-[#545454] hover:bg-[#efefef]"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="https://avatar.iran.liara.run/public/37"
                  alt="User"
                />
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user && (
              <DropdownMenuItem className="flex flex-col items-start">
                <span className="font-medium">
                  {user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`
                    : user.email}
                </span>
                <span className="text-xs text-[#858585]">{user.email}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={getSettingsPath()}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
