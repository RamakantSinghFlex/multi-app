import type React from "react"
import AuthGuard from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function ParentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard allowedRoles={["parent"]}>
      <div className="flex min-h-screen bg-[#f4f4f4]">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
