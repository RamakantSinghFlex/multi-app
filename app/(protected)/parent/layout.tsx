import type React from "react"
import AuthGuard from "@/components/auth-guard"
import ParentSidebar from "@/components/parent/sidebar"
import ParentHeader from "@/components/parent/header"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard allowedRoles={["parent"]}>
      <SidebarProvider>
        <div className="w-full flex min-h-screen bg-[#f4f4f4]">
          <div className="fixed z-30 h-screen">
            <ParentSidebar />
          </div>
          <div
            id="main-content"
            className="flex flex-1 flex-col transition-all duration-300 pl-64 w-full"
          >
            <ParentHeader />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
