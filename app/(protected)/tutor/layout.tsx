import type React from "react"
import AuthGuard from "@/components/auth-guard"
import ModernSidebar from "@/components/modern-sidebar"
import TutorHeader from "@/components/tutor/header"

export default function TutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard allowedRoles={["tutor"]}>
      <div className="flex min-h-screen bg-background">
        <ModernSidebar role="tutor" />
        <div className="flex flex-1 flex-col lg:ml-16 xl:ml-64">
          <TutorHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
