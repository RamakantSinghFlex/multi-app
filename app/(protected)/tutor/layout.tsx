import type React from "react"
import AuthGuard from "@/components/auth-guard"
import TutorSidebar from "@/components/tutor/sidebar"
import TutorHeader from "@/components/tutor/header"

export default function TutorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard allowedRoles={["tutor"]}>
      <div className="flex min-h-screen bg-background">
        <TutorSidebar />
        <div className="flex flex-1 flex-col md:ml-64">
          <TutorHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}

