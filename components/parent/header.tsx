"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
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
import Image from "next/image"
import chatIcon from "@/public/navbar/chat.svg"
import bellIcon from "@/public/navbar/bell.svg"
import { useIsSize } from "@/hooks/use-viewport"
import { BREAKPOINT_7XL } from "@/lib/utils/viewports"

export default function ParentHeader() {
  const { user, logout } = useAuth()
  const isMobile = useIsSize(BREAKPOINT_7XL)

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
        <h1 className="text-lg md:text-xl lg:text-2xl font-medium">
          Good Morning Leena!
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {!isMobile && (
          <>
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
              <Image
                src={chatIcon || "/placeholder.svg"}
                alt="Chat"
                className="h-5 w-5"
                width={20}
                height={20}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground rounded-full"
            >
              <Image
                src={bellIcon || "/placeholder.svg"}
                alt="Chat"
                className="h-5 w-5"
                width={20}
                height={20}
              />
            </Button>
          </>
        )}
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
