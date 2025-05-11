import AcademicPerformance from "@/components/landing/academic-performance"
import InsightsSection from "@/components/landing/insights-section"
import Hero from "@/components/landing/hero"
import SupportSection from "@/components/landing/support-section"
import SuccessStoriesSection from "@/components/landing/success-stories-section"
import MilestoneSection from "@/components/landing/milestone-section"
import TutorsSection from "@/components/landing/tutors-section"
import FAQSection from "@/components/landing/faq-section"
import BecomeTutorSection from "@/components/landing/become-tutor-section"
import Footer from "@/components/landing/footer"
import Navbar from "@/components/landing/navbar"
import { getPagesData } from "@/lib/api/pages"

export default async function Home() {
  const pages = await getPagesData(30, 1)
  const home = pages.data.docs.filter(
    (page: any) => page.title === "Home Page"
  )[0]

  // Blocks
  const header = home.layout.find((block: any) => block.blockType === "header")
  const hero = home.layout.find((block: any) => block.blockType === "hero")
  const support = home.layout.find(
    (block: any) => block.blockType === "support"
  )
  const successStories = home.layout.find(
    (block: any) => block.blockType === "success"
  )
  const performance = home.layout.find(
    (block: any) => block.blockType === "performance"
  )
  const learning = home.layout.find(
    (block: any) => block.blockType === "learning"
  )
  const trust = home.layout.find((block: any) => block.blockType === "trust")
  const inspiration = home.layout.find(
    (block: any) => block.blockType === "inspiration"
  )
  const faq = home.layout.find((block: any) => block.blockType === "faq")
  const apply = home.layout.find((block: any) => block.blockType === "apply")
  const footer = home.layout.find((block: any) => block.blockType === "footer")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar data={header} />
      <main className="flex-1">
        {/* Hero Section */}
        <Hero data={hero} />

        {/* Support for every stage */}
        <SupportSection data={support} />

        {/* Success Stories */}
        <SuccessStoriesSection data={successStories} />

        {/* How we increase performance */}
        <AcademicPerformance data={performance} />

        {/* Why Milestone Learning */}
        <MilestoneSection data={learning} />

        {/* Tutors */}
        <TutorsSection data={trust} />

        {/* Blog/Insights */}
        <InsightsSection data={inspiration} />

        {/* FAQ */}
        <FAQSection data={faq} />

        {/* Become a tutor */}
        <BecomeTutorSection data={apply} />
      </main>

      {/* Footer */}
      <Footer data={footer} />
    </div>
  )
}
