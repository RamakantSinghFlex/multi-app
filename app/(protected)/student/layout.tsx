import type React from "react"
import AuthGuard from "@/components/auth-guard"
import StudentSidebar from "@/components/student/sidebar"
import StudentHeader from "@/components/student/header"

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <div className="flex min-h-screen bg-background">
        <StudentSidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <StudentHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
