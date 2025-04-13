import type React from "react"
import AuthGuard from "@/components/auth-guard"
import ModernSidebar from "@/components/modern-sidebar"
import ParentHeader from "@/components/parent/header"

export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard allowedRoles={["parent"]}>
      <div className="flex min-h-screen bg-background">
        <ModernSidebar role="parent" />
        <div className="flex flex-1 flex-col lg:ml-16 xl:ml-64">
          <ParentHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
