import Navbar from "./landing/navbar"
import Hero from "./landing/hero"
import SupportSection from "./landing/support-section"
import SuccessStoriesSection from "./landing/success-stories-section"
import AcademicPerformance from "./landing/academic-performance"
import MilestoneSection from "./landing/milestone-section"
import TutorsSection from "./landing/tutors-section"
import InsightsSection from "./landing/insights-section"
import FAQSection from "./landing/faq-section"
import BecomeTutorSection from "./landing/become-tutor-section"
import Footer from "./landing/footer"

const blockTypes = {
  HEADER: "header",
  HERO: "hero",
  SUPPORT: "support",
  SUCCESS: "success",
  PERFORMANCE: "performance",
  LEARNING: "learning",
  TRUST: "trust",
  INSPIRATION: "inspiration",
  FAQ: "faq",
  APPLY: "apply",
  FOOTER: "footer",
}

export function RenderBlock({ layout }: { layout: any }) {
  switch (layout.blockType) {
    case blockTypes.HEADER:
      return <Navbar data={layout} />
    case blockTypes.HERO:
      return <Hero data={layout} />
    case blockTypes.SUPPORT:
      return <SupportSection data={layout} />
    case blockTypes.SUCCESS:
      return <SuccessStoriesSection data={layout} />
    case blockTypes.PERFORMANCE:
      return <AcademicPerformance data={layout} />
    case blockTypes.LEARNING:
      return <MilestoneSection data={layout} />
    case blockTypes.TRUST:
      return <TutorsSection data={layout} />
    case blockTypes.INSPIRATION:
      return <InsightsSection data={layout} />
    case blockTypes.FAQ:
      return <FAQSection data={layout} />
    case blockTypes.APPLY:
      return <BecomeTutorSection data={layout} />
    case blockTypes.FOOTER:
      return <Footer data={layout} />
    default:
      return null
  }
}
