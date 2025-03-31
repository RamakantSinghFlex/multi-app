import type React from "react"
import AuthGuard from "@/components/auth-guard"
import ParentSidebar from "@/components/parent/sidebar"
import ParentHeader from "@/components/parent/header"

export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard allowedRoles={["parent"]}>
      <div className="flex min-h-screen bg-background">
        <ParentSidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <ParentHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}

