"use client"

import type React from "react"
import AuthGuard from "@/components/auth-guard"
import ParentSidebar from "@/components/parent/sidebar"
import ParentHeader from "@/components/parent/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useIsSize } from "@/hooks/use-viewport"
import { BREAKPOINT_4XL } from "@/lib/utils/viewports"

export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMobile = useIsSize(BREAKPOINT_4XL)

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <SidebarProvider>
        <div className="w-full flex min-h-screen bg-[#f4f4f4]">
          {!isMobile ? (
            <div className="fixed z-30 h-screen">
              <ParentSidebar />
            </div>
          ) : null}
          {/* Sidebar */}
          <div
            id="main-content"
            className="flex flex-1 flex-col transition-all duration-300 w-full"
            style={{
              paddingLeft: isMobile ? 0 : "256px",
            }}
          >
            <ParentHeader />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
