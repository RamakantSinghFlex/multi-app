import type React from "react"
import { getPageData } from "@/lib/api/pages"
import { notFound } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pages = await getPageData("home")

  if (pages.data && pages.data.docs.length === 0) return notFound()

  const data = pages.data.docs.find((page: any) => page.slug === "home")

  if (!data) return notFound()

  const headerLayout = data.layout.find(
    (block: any) => block.blockType === "header"
  )
  const footerLayout = data.layout.find(
    (block: any) => block.blockType === "footer"
  )

  return (
    <AuthGuard allowedRoles={["parent", "student", "teacher"]}>
      <div className="flex min-h-screen flex-col">
        {headerLayout && <Navbar data={headerLayout} />}
        <main className="flex-1">{children}</main>
        {footerLayout && <Footer data={footerLayout} />}
      </div>
    </AuthGuard>
  )
}
