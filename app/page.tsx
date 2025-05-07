// "use client"

// import { useState, useEffect } from "react"
// import { useAuth } from "@/lib/auth-context"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { logger } from "@/lib/monitoring"
// import Image from "next/image"
// import {
//   ChevronDown,
//   ChevronUp,
//   Phone,
//   ArrowRight,
//   Check,
//   Mail,
// } from "lucide-react"

// export default function Home() {
//   const { isAuthenticated, isLoading, user } = useAuth()
//   const [error, setError] = useState<string | null>(null)
//   const [pageLoading, setPageLoading] = useState(true)

//   // Additional check for valid authentication with proper optional chaining
//   const isReallyAuthenticated =
//     isAuthenticated &&
//     user &&
//     user.roles &&
//     Array.isArray(user.roles) &&
//     user.roles?.length > 0

//   useEffect(() => {
//     if (!isLoading) {
//       logger.info("Home page: Auth check complete", {
//         isAuthenticated: isAuthenticated,
//         user: user,
//         hasRoles:
//           user?.roles && Array.isArray(user?.roles)
//             ? user.roles?.length > 0
//             : false,
//       })
//       setPageLoading(false)
//     }
//   }, [isLoading, isAuthenticated, user])

//   // If there's an error during navigation
//   if (error) {
//     return (
//       <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
//         <div className="text-destructive">
//           <p className="text-lg font-semibold">Navigation Error</p>
//           <p>{error}</p>
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
//         >
//           Refresh Page
//         </button>
//       </div>
//     )
//   }

//   // Show a loading state while checking authentication
//   if (pageLoading) {
//     return (
//       <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
//         <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
//       </div>
//     )
//   }

//   return (
//     <main className="min-h-screen">
//       {/* Header/Navigation */}
//       <header className="border-b py-4">
//         <div className="container mx-auto px-4 flex justify-between items-center">
//           <div className="flex items-center">
//             <div className="text-[#004D40] font-serif text-2xl">
//               Milestone <span className="text-[#00695C]">| Learning</span>
//             </div>
//           </div>

//           <nav className="hidden md:flex items-center space-x-8">
//             <Link href="#" className="text-gray-700 hover:text-[#004D40]">
//               About Us
//             </Link>
//             <Link href="#" className="text-gray-700 hover:text-[#004D40]">
//               What We Do
//             </Link>
//             <Link href="#" className="text-gray-700 hover:text-[#004D40]">
//               Resources
//             </Link>
//             <Link href="#" className="text-gray-700 hover:text-[#004D40]">
//               Contact Us
//             </Link>
//           </nav>

//           <div className="flex items-center space-x-4">
//             <Link
//               href="tel:XXX-XXX-XXXX"
//               className="hidden md:flex items-center border rounded-full px-4 py-2 text-gray-700"
//             >
//               <Phone className="w-4 h-4 mr-2" />
//               XXX-XXX-XXXX
//             </Link>
//             <Link
//               href="/login"
//               className="bg-[#004D40] text-white px-6 py-2 rounded-full hover:bg-[#00695C] transition"
//             >
//               Login
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
//           <div className="space-y-6">
//             <h1 className="text-4xl md:text-5xl font-bold text-[#004D40] leading-tight">
//               Empowering every Student with personalized learning for lasting
//               success
//             </h1>
//             <div className="space-y-3">
//               <div className="flex items-start">
//                 <Check className="text-[#004D40] w-6 h-6 mr-2 mt-1 flex-shrink-0" />
//                 <p>Personalized, efficient learning</p>
//               </div>
//               <div className="flex items-start">
//                 <Check className="text-[#004D40] w-6 h-6 mr-2 mt-1 flex-shrink-0" />
//                 <p>Deep collaboration with parents & students</p>
//               </div>
//               <div className="flex items-start">
//                 <Check className="text-[#004D40] w-6 h-6 mr-2 mt-1 flex-shrink-0" />
//                 <p>Personalized One-on-One Learning</p>
//               </div>
//             </div>
//             <div>
//               <Link
//                 href="#"
//                 className="inline-block bg-[#004D40] text-white px-6 py-3 rounded-full hover:bg-[#00695C] transition font-medium"
//               >
//                 Get Started Today
//               </Link>
//             </div>
//           </div>
//           <div className="relative h-[400px]">
//             {/* Hero image */}
//             <Image
//               src="/photo1.png.png"
//               alt="Milestone Learning Hero"
//               className="w-full h-full object-cover rounded-lg"
//               width={400}
//               height={400}
//             />
//           </div>
//         </div>
//       </section>

//       {/* Support for Every Stage Section */}
//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl md:text-4xl font-bold text-[#004D40] text-center mb-4">
//             Support for every stage of learning
//           </h2>
//           <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
//             From foundational skills to advanced academics, we're with you every
//             step of the way.
//           </p>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {/* Card 1 */}
//             <div className="bg-white border rounded-lg overflow-hidden flex">
//               <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
//               </div>
//               <div className="w-2/3 p-6">
//                 <h3 className="font-bold text-lg mb-2">Test Prep</h3>
//                 <p className="text-gray-700 text-sm">
//                   Expert coaching for SSAT, SAT, ACT, AP exams, and more.
//                 </p>
//               </div>
//             </div>

//             {/* Card 2 */}
//             <div className="bg-white border rounded-lg overflow-hidden flex">
//               <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
//               </div>
//               <div className="w-2/3 p-6">
//                 <h3 className="font-bold text-lg mb-2">College/University</h3>
//                 <p className="text-gray-700 text-sm">
//                   Tutoring for advanced coursework, writing, and academic
//                   strategy.
//                 </p>
//               </div>
//             </div>

//             {/* Card 3 */}
//             <div className="bg-white border rounded-lg overflow-hidden flex">
//               <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
//               </div>
//               <div className="w-2/3 p-6">
//                 <h3 className="font-bold text-lg mb-2">Graduate School</h3>
//                 <p className="text-gray-700 text-sm">
//                   Language prep, writing mentorship, and exam support for
//                   advanced learners.
//                 </p>
//               </div>
//             </div>

//             {/* Card 4 */}
//             <div className="bg-white border rounded-lg overflow-hidden flex">
//               <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
//               </div>
//               <div className="w-2/3 p-6">
//                 <h3 className="font-bold text-lg mb-2">Elementary School</h3>
//                 <p className="text-gray-700 text-sm">
//                   Foundational support in reading, writing, math, and study
//                   habits.
//                 </p>
//               </div>
//             </div>

//             {/* Card 5 */}
//             <div className="bg-white border rounded-lg overflow-hidden flex">
//               <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
//               </div>
//               <div className="w-2/3 p-6">
//                 <h3 className="font-bold text-lg mb-2">Middle School</h3>
//                 <p className="text-gray-700 text-sm">
//                   Skill-building across core subjects to support academic
//                   transitions.
//                 </p>
//               </div>
//             </div>

//             {/* Card 6 */}
//             <div className="bg-white border rounded-lg overflow-hidden flex">
//               <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
//               </div>
//               <div className="w-2/3 p-6">
//                 <h3 className="font-bold text-lg mb-2">High School</h3>
//                 <p className="text-gray-700 text-sm">
//                   Rigorous subject support, test prep, and college readiness.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Success Stories Section */}
//       <section className="py-16 bg-gray-100">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl md:text-4xl font-bold text-[#004D40] text-center mb-4">
//             Success we've achieved together
//           </h2>
//           <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
//             Together, we celebrate every milestone—turning challenges into
//             achievements and goals into reality.
//           </p>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {/* Testimonial 1 */}
//             <div className="bg-white p-8 rounded-lg shadow-sm">
//               <div className="text-[#004D40] text-5xl font-serif mb-4">"</div>
//               <p className="text-gray-800 mb-6">
//                 My son went from struggling in science to earning his best
//                 grades ever. His tutor made the material click in a way his
//                 classes never did.
//               </p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
//                   <Image
//                     src="/photo2.png.png"
//                     alt="Kate Wills"
//                     className="w-full h-full object-cover"
//                     width={48}
//                     height={48}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-bold text-[#004D40]">Kate Wills</p>
//                   <p className="text-sm text-gray-600">Parent | 8th Standard</p>
//                 </div>
//               </div>
//             </div>

//             {/* Testimonial 2 */}
//             <div className="bg-white p-8 rounded-lg shadow-sm">
//               <div className="text-[#004D40] text-5xl font-serif mb-4">"</div>
//               <p className="text-gray-800 mb-6">
//                 My son went from struggling in science to earning his best
//                 grades ever. His tutor made the material click in a way his
//                 classes never did.
//               </p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
//                   <Image
//                     src="/photo2.png.png"
//                     alt="Kate Wills"
//                     className="w-full h-full object-cover"
//                     width={48}
//                     height={48}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-bold text-[#004D40]">Kate Wills</p>
//                   <p className="text-sm text-gray-600">Parent | 8th Standard</p>
//                 </div>
//               </div>
//             </div>

//             {/* Testimonial 3 */}
//             <div className="bg-white p-8 rounded-lg shadow-sm">
//               <div className="text-[#004D40] text-5xl font-serif mb-4">"</div>
//               <p className="text-gray-800 mb-6">
//                 My son went from struggling in science to earning his best
//                 grades ever. His tutor made the material click in a way his
//                 classes never did.
//               </p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
//                   <Image
//                     src="/photo2.png.png"
//                     alt="Kate Wills"
//                     className="w-full h-full object-cover"
//                     width={48}
//                     height={48}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-bold text-[#004D40]">Kate Wills</p>
//                   <p className="text-sm text-gray-600">Parent | 8th Standard</p>
//                 </div>
//               </div>
//             </div>

//             {/* Testimonial 4 */}
//             <div className="bg-white p-8 rounded-lg shadow-sm">
//               <div className="text-[#004D40] text-5xl font-serif mb-4">"</div>
//               <p className="text-gray-800 mb-6">
//                 My son went from struggling in science to earning his best
//                 grades ever. His tutor made the material click in a way his
//                 classes never did.
//               </p>
//               <div className="flex items-center">
//                 <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
//                   <Image
//                     src="/photo2.png.png"
//                     alt="Kate Wills"
//                     className="w-full h-full object-cover"
//                     width={48}
//                     height={48}
//                   />
//                 </div>
//                 <div>
//                   <p className="font-bold text-[#004D40]">Kate Wills</p>
//                   <p className="text-sm text-gray-600">Parent | 8th Standard</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-center mt-10">
//             <Link
//               href="#"
//               className="border border-[#004D40] text-[#004D40] px-8 py-3 rounded-full hover:bg-[#E8F5E9] transition"
//             >
//               View All
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* How We Increase Academic Performance */}
//       <section className="py-16">
//         <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
//           <div className="md:col-span-1">
//             <h2 className="text-3xl font-bold text-[#004D40] mb-4">
//               How we increase academic performance
//             </h2>
//             <p className="text-gray-700 mb-4">
//               The most successful learning is{" "}
//               <span className="font-bold">one-on-one</span>.
//             </p>
//             <p className="text-gray-700 mb-6">
//               At <span className="font-bold">Milestone Learning</span>, we
//               recognize that every student learns differently—success comes from
//               tailored support, personalized strategies, and a learning approach
//               that works for them.
//             </p>
//             <Link
//               href="#"
//               className="flex items-center text-[#004D40] font-medium"
//             >
//               Learn More <ArrowRight className="w-4 h-4 ml-2" />
//             </Link>
//           </div>

//           <div className="md:col-span-3 grid md:grid-cols-3 gap-6">
//             {/* Image 1 */}
//             <div className="space-y-4">
//               <div className="aspect-video rounded-lg overflow-hidden">
//                 <Image
//                   src="/photo5.png.png"
//                   alt="Schedule a Consultation"
//                   className="w-full h-full object-cover"
//                   width={800}
//                   height={450}
//                 />
//               </div>
//               <Link
//                 href="#"
//                 className="block w-full bg-[#004D40] text-white text-center py-3 rounded-md hover:bg-[#00695C] transition"
//               >
//                 Schedule a Consultation
//               </Link>
//             </div>

//             {/* Image 2 */}
//             <div className="space-y-4">
//               <div className="aspect-video rounded-lg overflow-hidden">
//                 <Image
//                   src="/photo3.png.png"
//                   alt="Submit an Inquiry"
//                   className="w-full h-full object-cover"
//                   width={800}
//                   height={450}
//                 />
//               </div>
//               <Link
//                 href="#"
//                 className="block w-full bg-[#004D40] text-white text-center py-3 rounded-md hover:bg-[#00695C] transition"
//               >
//                 Submit an Inquiry
//               </Link>
//             </div>

//             {/* Image 3 */}
//             <div className="space-y-4">
//               <div className="aspect-video rounded-lg overflow-hidden">
//                 <Image
//                   src="/photo4.png.png"
//                   alt="Book a Session"
//                   className="w-full h-full object-cover"
//                   width={800}
//                   height={450}
//                 />
//               </div>
//               <Link
//                 href="#"
//                 className="block w-full bg-[#004D40] text-white text-center py-3 rounded-md hover:bg-[#00695C] transition"
//               >
//                 Book a Session
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Why Milestone Learning Section */}
//       <section className="py-16 bg-[#004D40] text-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
//             Why Milestone Learning?
//           </h2>
//           <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
//             {/* Card 1 */}
//             <div className="bg-white rounded-lg p-8 text-center">
//               <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
//               </div>
//               <h3 className="text-[#004D40] font-bold text-xl mb-2">
//                 Personalized, efficient learning
//               </h3>
//               <p className="text-gray-700 text-sm">
//                 Tailored instruction that maximizes understanding and progress.
//               </p>
//             </div>

//             {/* Card 2 */}
//             <div className="bg-white rounded-lg p-8 text-center">
//               <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
//               </div>
//               <h3 className="text-[#004D40] font-bold text-xl mb-2">
//                 Collaboration with parents & students
//               </h3>
//               <p className="text-gray-700 text-sm">
//                 Clear communication and ongoing feedback to align on goals.
//               </p>
//             </div>

//             {/* Card 3 */}
//             <div className="bg-white rounded-lg p-8 text-center">
//               <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
//               </div>
//               <h3 className="text-[#004D40] font-bold text-xl mb-2">
//                 Long-term skill development
//               </h3>
//               <p className="text-gray-700 text-sm">
//                 Focused on growth, mastery, and real results.
//               </p>
//             </div>

//             {/* Card 4 */}
//             <div className="bg-white rounded-lg p-8 text-center">
//               <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
//               </div>
//               <h3 className="text-[#004D40] font-bold text-xl mb-2">
//                 A nurturing, supportive environment
//               </h3>
//               <p className="text-gray-700 text-sm">
//                 Meeting students where they are and helping them thrive.
//               </p>
//             </div>

//             {/* Card 5 */}
//             <div className="bg-white rounded-lg p-8 text-center">
//               <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 {/* Icon placeholder */}
//                 <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
//               </div>
//               <h3 className="text-[#004D40] font-bold text-xl mb-2">
//                 Confidence-building for success
//               </h3>
//               <p className="text-gray-700 text-sm">
//                 Strategies to reduce anxiety and improve academic performance.
//               </p>
//             </div>
//           </div>
//           <div className="flex justify-center mt-12 space-x-4">
//             <Link
//               href="#"
//               className="bg-white text-[#004D40] px-6 py-3 rounded-full hover:bg-gray-100 transition font-medium"
//             >
//               Get Started Today
//             </Link>
//             <Link
//               href="#"
//               className="border border-white text-white px-6 py-3 rounded-full hover:bg-[#00695C] transition font-medium"
//             >
//               Learn More
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Trusted Tutors Section */}
//       <section className="py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-green-900 text-center mb-12">
//             Tutors you can trust from
//           </h2>
//           <div className="grid grid-cols-4 md:grid-cols-8 gap-8">
//             {/* University Logo Images */}
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
//               <Image
//                 src="/photo6.png.png"
//                 alt="University Logo"
//                 className="w-full h-12 object-contain"
//                 width={100}
//                 height={48}
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Insights & Inspiration Section */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-4">
//             Insights & inspiration from the world of one-on-one learning
//           </h2>
//           <p className="text-center text-gray-700 max-w-4xl mx-auto mb-12">
//             Explore expert perspectives, success stories, and timely topics in
//             education—designed for parents, students, and families navigating
//             academic excellence in today's competitive world.
//           </p>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {/* Blog Card 1 */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="aspect-video">
//                 <Image
//                   src="/photo10.png.png"
//                   alt="Learning Styles in Tutoring"
//                   className="w-full h-full object-cover"
//                   width={800}
//                   height={450}
//                 />
//               </div>
//               <div className="p-6">
//                 <h3 className="font-bold text-green-900 mb-2">
//                   Learning Styles in Tutoring: Tailoring Approaches for
//                   Effective Student Engagement
//                 </h3>
//                 <p className="text-gray-700 text-sm mb-4">
//                   Understanding different learning styles is essential for
//                   effective tutoring and can significantly enhance your teaching
//                   approach
//                 </p>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Guidance</span>
//                   <span className="text-sm text-gray-600">5 mins read</span>
//                 </div>
//               </div>
//             </div>

//             {/* Blog Card 2 */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="aspect-video">
//                 <Image
//                   src="/photo10.png.png"
//                   alt="Learning Styles in Tutoring"
//                   className="w-full h-full object-cover"
//                   width={800}
//                   height={450}
//                 />
//               </div>
//               <div className="p-6">
//                 <h3 className="font-bold text-green-900 mb-2">
//                   Learning Styles in Tutoring: Tailoring Approaches for
//                   Effective Student Engagement
//                 </h3>
//                 <p className="text-gray-700 text-sm mb-4">
//                   Understanding different learning styles is essential for
//                   effective tutoring and can significantly enhance your teaching
//                   approach
//                 </p>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Guidance</span>
//                   <span className="text-sm text-gray-600">5 mins read</span>
//                 </div>
//               </div>
//             </div>

//             {/* Blog Card 3 */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="aspect-video">
//                 <Image
//                   src="/photo10.png.png"
//                   alt="Learning Styles in Tutoring"
//                   className="w-full h-full object-cover"
//                   width={800}
//                   height={450}
//                 />
//               </div>
//               <div className="p-6">
//                 <h3 className="font-bold text-green-900 mb-2">
//                   Learning Styles in Tutoring: Tailoring Approaches for
//                   Effective Student Engagement
//                 </h3>
//                 <p className="text-gray-700 text-sm mb-4">
//                   Understanding different learning styles is essential for
//                   effective tutoring and can significantly enhance your teaching
//                   approach
//                 </p>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Guidance</span>
//                   <span className="text-sm text-gray-600">5 mins read</span>
//                 </div>
//               </div>
//             </div>

//             {/* Blog Card 4 */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="aspect-video">
//                 <Image
//                   src="/photo10.png.png"
//                   alt="Learning Styles in Tutoring"
//                   className="w-full h-full object-cover"
//                   width={800}
//                   height={450}
//                 />
//               </div>
//               <div className="p-6">
//                 <h3 className="font-bold text-green-900 mb-2">
//                   Learning Styles in Tutoring: Tailoring Approaches for
//                   Effective Student Engagement
//                 </h3>
//                 <p className="text-gray-700 text-sm mb-4">
//                   Understanding different learning styles is essential for
//                   effective tutoring and can significantly enhance your teaching
//                   approach
//                 </p>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Guidance</span>
//                   <span className="text-sm text-gray-600">5 mins read</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-center mt-10">
//             <Link
//               href="#"
//               className="border border-green-900 text-green-900 px-8 py-3 rounded-full hover:bg-green-50 transition"
//             >
//               View All
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
//           <div className="md:col-span-1">
//             <h2 className="text-3xl font-bold text-[#004D40] mb-4">
//               Frequently asked questions
//             </h2>
//             <p className="text-gray-700">
//               Find answers to common questions and get the information you need!
//             </p>
//           </div>

//           <div className="md:col-span-2 space-y-4">
//             {/* FAQ Item 1 - Expanded */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
//                 <h3 className="font-medium text-[#004D40]">
//                   What makes Milestone Learning different from other tutoring
//                   services?
//                 </h3>
//                 <ChevronUp className="w-5 h-5 text-[#004D40]" />
//               </div>
//               <div className="p-6 bg-white border-t">
//                 <p className="text-gray-700">
//                   We specialize in one-on-one, highly personalized tutoring that
//                   goes beyond just helping students with homework. Our expert
//                   tutors focus on mastery, confidence-building, and academic
//                   strategy, ensuring that students not only improve their grades
//                   but also develop lifelong learning skills.
//                 </p>
//               </div>
//             </div>

//             {/* FAQ Item 2 - Collapsed */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
//                 <h3 className="font-medium text-[#004D40]">
//                   Who are your tutors?
//                 </h3>
//                 <ChevronDown className="w-5 h-5 text-[#004D40]" />
//               </div>
//             </div>

//             {/* FAQ Item 3 - Collapsed */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
//                 <h3 className="font-medium text-[#004D40]">
//                   How do you match students with tutors?
//                 </h3>
//                 <ChevronDown className="w-5 h-5 text-[#004D40]" />
//               </div>
//             </div>

//             {/* FAQ Item 4 - Collapsed */}
//             <div className="border rounded-lg overflow-hidden">
//               <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
//                 <h3 className="font-medium text-[#004D40]">
//                   Do you offer in-person tutoring?
//                 </h3>
//                 <ChevronDown className="w-5 h-5 text-[#004D40]" />
//               </div>
//             </div>

//             <div className="flex justify-center mt-6">
//               <Link
//                 href="#"
//                 className="border border-[#004D40] text-[#004D40] px-8 py-3 rounded-full hover:bg-[#E8F5E9] transition"
//               >
//                 View All
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Tutor Recruitment Banner */}
//       <section className="py-12 bg-gray-100">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
//             Interested in becoming a tutor with Milestone Learning?
//           </h2>
//           <p className="text-gray-700 max-w-3xl mx-auto mb-8">
//             Make a lasting impact—join a team where your expertise empowers
//             students and your growth is supported every step of the way.
//           </p>
//           <Link
//             href="#"
//             className="inline-block bg-green-900 text-white px-8 py-3 rounded-full hover:bg-green-800 transition font-medium"
//           >
//             Apply Now
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="py-12 bg-[#004D40] text-white">
//         <div className="container mx-auto px-4">
//           <div className="grid md:grid-cols-4 gap-8">
//             <div>
//               <div className="text-white font-serif text-2xl mb-4">
//                 Milestone <span className="text-gray-300">| Learning</span>
//               </div>
//               <p className="text-gray-300 mb-4">
//                 Personalized tutoring that empowers students to achieve academic
//                 excellence and build confidence.
//               </p>
//               <div className="flex space-x-4">
//                 {/* Social media icons */}
//                 <Link href="#" className="text-white hover:text-gray-300">
//                   <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                     {/* Icon placeholder */}
//                   </div>
//                 </Link>
//                 <Link href="#" className="text-white hover:text-gray-300">
//                   <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                     {/* Icon placeholder */}
//                   </div>
//                 </Link>
//                 <Link href="#" className="text-white hover:text-gray-300">
//                   <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//                     {/* Icon placeholder */}
//                   </div>
//                 </Link>
//               </div>
//             </div>

//             <div>
//               <h3 className="font-bold text-lg mb-4">Quick Links</h3>
//               <ul className="space-y-2">
//                 <li>
//                   <Link href="#" className="text-gray-300 hover:text-white">
//                     About Us
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-gray-300 hover:text-white">
//                     Our Services
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-gray-300 hover:text-white">
//                     Become a Tutor
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-gray-300 hover:text-white">
//                     Resources
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-gray-300 hover:text-white">
//                     Contact Us
//                   </Link>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h3 className="font-bold text-lg mb-4">Book a Consultation</h3>
//               <ul className="space-y-2">
//                 <li>
//                   <Link href="#" className="text-gray-300 hover:text-white">
//                     Book a Learning Session
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="#" className="text-gray-300 hover:text-white">
//                     FAQ
//                   </Link>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h3 className="font-bold text-lg mb-4">Contact Us</h3>
//               <ul className="space-y-2">
//                 <li className="flex items-center text-gray-300">
//                   <Phone className="w-5 h-5 mr-2" />
//                   XXX-XXX-XXXX
//                 </li>
//                 <li className="flex items-center text-gray-300">
//                   <Mail className="w-5 h-5 mr-2" />
//                   hello@milestonelearning.com
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
//             <p className="text-gray-300 text-sm">
//               © 2025 Milestone Learning. All rights reserved.
//             </p>
//             <div className="flex space-x-6 mt-4 md:mt-0">
//               <Link href="#" className="text-gray-300 text-sm hover:text-white">
//                 Privacy Policy
//               </Link>
//               <Link href="#" className="text-gray-300 text-sm hover:text-white">
//                 Terms of Services
//               </Link>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </main>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
// import { Button } from "@/components/ui/button"
import { logger } from "@/lib/monitoring"
import Image from "next/image"
import {
  ChevronDown,
  ChevronUp,
  Phone,
  ArrowRight,
  Check,
  Mail,
} from "lucide-react"

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()
  // const [error, setError] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  // Additional check for valid authentication with proper optional chaining
  // const isReallyAuthenticated =
  //   isAuthenticated &&
  //   user &&
  //   user.roles &&
  //   Array.isArray(user.roles) &&
  //   user.roles?.length > 0

  useEffect(() => {
    if (!isLoading) {
      logger.info("Home page: Auth check complete", {
        isAuthenticated: isAuthenticated,
        user: user,
        hasRoles:
          user?.roles && Array.isArray(user?.roles)
            ? user.roles?.length > 0
            : false,
      })
      setPageLoading(false)
    }
  }, [isLoading, isAuthenticated, user])

  // If there's an error during navigation
  // if (error) {
  //   return (
  //     <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
  //       <div className="text-destructive">
  //         <p className="text-lg font-semibold">Navigation Error</p>
  //         <p>{error}</p>
  //       </div>
  //       <button
  //         onClick={() => window.location.reload()}
  //         className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
  //       >
  //         Refresh Page
  //       </button>
  //     </div>
  //   )
  // }

  // Show a loading state while checking authentication
  if (pageLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Header/Navigation */}
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-[#004D40] font-serif text-2xl">
              Milestone <span className="text-[#00695C]">| Learning</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-gray-700 hover:text-[#004D40]">
              About Us
            </Link>
            <Link href="#" className="text-gray-700 hover:text-[#004D40]">
              What We Do
            </Link>
            <Link href="#" className="text-gray-700 hover:text-[#004D40]">
              Resources
            </Link>
            <Link href="#" className="text-gray-700 hover:text-[#004D40]">
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="tel:XXX-XXX-XXXX"
              className="hidden md:flex items-center border rounded-full px-4 py-2 text-gray-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              XXX-XXX-XXXX
            </Link>
            <Link
              href="/login"
              className="bg-[#004D40] text-white px-6 py-2 rounded-full hover:bg-[#00695C] transition"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#004D40] leading-tight">
              Empowering every Student with personalized learning for lasting
              success
            </h1>
            <div className="space-y-3">
              <div className="flex items-start">
                <Check className="text-[#004D40] w-6 h-6 mr-2 mt-1 flex-shrink-0" />
                <p>Personalized, efficient learning</p>
              </div>
              <div className="flex items-start">
                <Check className="text-[#004D40] w-6 h-6 mr-2 mt-1 flex-shrink-0" />
                <p>Deep collaboration with parents & students</p>
              </div>
              <div className="flex items-start">
                <Check className="text-[#004D40] w-6 h-6 mr-2 mt-1 flex-shrink-0" />
                <p>Personalized One-on-One Learning</p>
              </div>
            </div>
            <div>
              <Link
                href="#"
                className="inline-block bg-[#004D40] text-white px-6 py-3 rounded-full hover:bg-[#00695C] transition font-medium"
              >
                Get Started Today
              </Link>
            </div>
          </div>
          <div className="relative h-[400px]">
            {/* Hero image */}
            <Image
              src="/photo1.png.png"
              alt="Milestone Learning Hero"
              className="w-full h-full object-cover rounded-lg"
              width={400}
              height={400}
            />
          </div>
        </div>
      </section>

      {/* Support for Every Stage Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004D40] text-center mb-4">
            Support for every stage of learning
          </h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
            From foundational skills to advanced academics, we&apos;re with you
            every step of the way.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-2/3 p-6">
                <h3 className="font-bold text-lg mb-2">Test Prep</h3>
                <p className="text-gray-700 text-sm">
                  Expert coaching for SSAT, SAT, ACT, AP exams, and more.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-2/3 p-6">
                <h3 className="font-bold text-lg mb-2">College/University</h3>
                <p className="text-gray-700 text-sm">
                  Tutoring for advanced coursework, writing, and academic
                  strategy.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-2/3 p-6">
                <h3 className="font-bold text-lg mb-2">Graduate School</h3>
                <p className="text-gray-700 text-sm">
                  Language prep, writing mentorship, and exam support for
                  advanced learners.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-2/3 p-6">
                <h3 className="font-bold text-lg mb-2">Elementary School</h3>
                <p className="text-gray-700 text-sm">
                  Foundational support in reading, writing, math, and study
                  habits.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-2/3 p-6">
                <h3 className="font-bold text-lg mb-2">Middle School</h3>
                <p className="text-gray-700 text-sm">
                  Skill-building across core subjects to support academic
                  transitions.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white border rounded-lg overflow-hidden flex">
              <div className="w-1/3 bg-[#E8F5E9] p-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-2/3 p-6">
                <h3 className="font-bold text-lg mb-2">High School</h3>
                <p className="text-gray-700 text-sm">
                  Rigorous subject support, test prep, and college readiness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004D40] text-center mb-4">
            Success we&apos;ve achieved together
          </h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
            Together, we celebrate every milestone—turning challenges into
            achievements and goals into reality.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-[#004D40] text-5xl font-serif mb-4">
                &quot;
              </div>
              <p className="text-gray-800 mb-6">
                My son went from struggling in science to earning his best
                grades ever. His tutor made the material click in a way his
                classes never did.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/photo2.png.png"
                    alt="Kate Wills"
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-bold text-[#004D40]">Kate Wills</p>
                  <p className="text-sm text-gray-600">Parent | 8th Standard</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-[#004D40] text-5xl font-serif mb-4">
                &quot;
              </div>
              <p className="text-gray-800 mb-6">
                My son went from struggling in science to earning his best
                grades ever. His tutor made the material click in a way his
                classes never did.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/photo2.png.png"
                    alt="Kate Wills"
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-bold text-[#004D40]">Kate Wills</p>
                  <p className="text-sm text-gray-600">Parent | 8th Standard</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-[#004D40] text-5xl font-serif mb-4">
                &quot;
              </div>
              <p className="text-gray-800 mb-6">
                My son went from struggling in science to earning his best
                grades ever. His tutor made the material click in a way his
                classes never did.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/photo2.png.png"
                    alt="Kate Wills"
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-bold text-[#004D40]">Kate Wills</p>
                  <p className="text-sm text-gray-600">Parent | 8th Standard</p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-[#004D40] text-5xl font-serif mb-4">
                &quot;
              </div>
              <p className="text-gray-800 mb-6">
                My son went from struggling in science to earning his best
                grades ever. His tutor made the material click in a way his
                classes never did.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/photo2.png.png"
                    alt="Kate Wills"
                    className="w-full h-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-bold text-[#004D40]">Kate Wills</p>
                  <p className="text-sm text-gray-600">Parent | 8th Standard</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Link
              href="#"
              className="border border-[#004D40] text-[#004D40] px-8 py-3 rounded-full hover:bg-[#E8F5E9] transition"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* How We Increase Academic Performance */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-3xl font-bold text-[#004D40] mb-4">
              How we increase academic performance
            </h2>
            <p className="text-gray-700 mb-4">
              The most successful learning is{" "}
              <span className="font-bold">one-on-one</span>.
            </p>
            <p className="text-gray-700 mb-6">
              At <span className="font-bold">Milestone Learning</span>, we
              recognize that every student learns differently—success comes from
              tailored support, personalized strategies, and a learning approach
              that works for them.
            </p>
            <Link
              href="#"
              className="flex items-center text-[#004D40] font-medium"
            >
              Learn More <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="md:col-span-3 grid md:grid-cols-3 gap-6">
            {/* Image 1 */}
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <Image
                  src="/photo5.png.png"
                  alt="Schedule a Consultation"
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
              <Link
                href="#"
                className="block w-full bg-[#004D40] text-white text-center py-3 rounded-md hover:bg-[#00695C] transition"
              >
                Schedule a Consultation
              </Link>
            </div>

            {/* Image 2 */}
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <Image
                  src="/photo3.png.png"
                  alt="Submit an Inquiry"
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
              <Link
                href="#"
                className="block w-full bg-[#004D40] text-white text-center py-3 rounded-md hover:bg-[#00695C] transition"
              >
                Submit an Inquiry
              </Link>
            </div>

            {/* Image 3 */}
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <Image
                  src="/photo4.png.png"
                  alt="Book a Session"
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
              <Link
                href="#"
                className="block w-full bg-[#004D40] text-white text-center py-3 rounded-md hover:bg-[#00695C] transition"
              >
                Book a Session
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Milestone Learning Section */}
      <section className="py-16 bg-[#004D40] text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Milestone Learning?
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-[#004D40] font-bold text-xl mb-2">
                Personalized, efficient learning
              </h3>
              <p className="text-gray-700 text-sm">
                Tailored instruction that maximizes understanding and progress.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-[#004D40] font-bold text-xl mb-2">
                Collaboration with parents & students
              </h3>
              <p className="text-gray-700 text-sm">
                Clear communication and ongoing feedback to align on goals.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-[#004D40] font-bold text-xl mb-2">
                Long-term skill development
              </h3>
              <p className="text-gray-700 text-sm">
                Focused on growth, mastery, and real results.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-[#004D40] font-bold text-xl mb-2">
                A nurturing, supportive environment
              </h3>
              <p className="text-gray-700 text-sm">
                Meeting students where they are and helping them thrive.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {/* Icon placeholder */}
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-[#004D40] font-bold text-xl mb-2">
                Confidence-building for success
              </h3>
              <p className="text-gray-700 text-sm">
                Strategies to reduce anxiety and improve academic performance.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-12 space-x-4">
            <Link
              href="#"
              className="bg-white text-[#004D40] px-6 py-3 rounded-full hover:bg-gray-100 transition font-medium"
            >
              Get Started Today
            </Link>
            <Link
              href="#"
              className="border border-white text-white px-6 py-3 rounded-full hover:bg-[#00695C] transition font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Tutors Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-green-900 text-center mb-12">
            Tutors you can trust from
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8">
            {/* University Logo Images */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
              <Image
                src="/photo6.png.png"
                alt="University Logo"
                className="w-full h-12 object-contain"
                width={100}
                height={48}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Insights & Inspiration Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-4">
            Insights & inspiration from the world of one-on-one learning
          </h2>
          <p className="text-center text-gray-700 max-w-4xl mx-auto mb-12">
            Explore expert perspectives, success stories, and timely topics in
            education—designed for parents, students, and families navigating
            academic excellence in todays competitive world.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Blog Card 1 */}
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video">
                <Image
                  src="/photo10.png.png"
                  alt="Learning Styles in Tutoring"
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-green-900 mb-2">
                  Learning Styles in Tutoring: Tailoring Approaches for
                  Effective Student Engagement
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Understanding different learning styles is essential for
                  effective tutoring and can significantly enhance your teaching
                  approach
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Guidance</span>
                  <span className="text-sm text-gray-600">5 mins read</span>
                </div>
              </div>
            </div>

            {/* Blog Card 2 */}
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video">
                <Image
                  src="/photo10.png.png"
                  alt="Learning Styles in Tutoring"
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-green-900 mb-2">
                  Learning Styles in Tutoring: Tailoring Approaches for
                  Effective Student Engagement
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Understanding different learning styles is essential for
                  effective tutoring and can significantly enhance your teaching
                  approach
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Guidance</span>
                  <span className="text-sm text-gray-600">5 mins read</span>
                </div>
              </div>
            </div>

            {/* Blog Card 3 */}
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video">
                <Image
                  src="/photo10.png.png"
                  alt="Learning Styles in Tutoring"
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-green-900 mb-2">
                  Learning Styles in Tutoring: Tailoring Approaches for
                  Effective Student Engagement
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Understanding different learning styles is essential for
                  effective tutoring and can significantly enhance your teaching
                  approach
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Guidance</span>
                  <span className="text-sm text-gray-600">5 mins read</span>
                </div>
              </div>
            </div>

            {/* Blog Card 4 */}
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video">
                <Image
                  src="/photo10.png.png"
                  alt="Learning Styles in Tutoring"
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-green-900 mb-2">
                  Learning Styles in Tutoring: Tailoring Approaches for
                  Effective Student Engagement
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Understanding different learning styles is essential for
                  effective tutoring and can significantly enhance your teaching
                  approach
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Guidance</span>
                  <span className="text-sm text-gray-600">5 mins read</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Link
              href="#"
              className="border border-green-900 text-green-900 px-8 py-3 rounded-full hover:bg-green-50 transition"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h2 className="text-3xl font-bold text-[#004D40] mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-700">
              Find answers to common questions and get the information you need!
            </p>
          </div>

          <div className="md:col-span-2 space-y-4">
            {/* FAQ Item 1 - Expanded */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
                <h3 className="font-medium text-[#004D40]">
                  What makes Milestone Learning different from other tutoring
                  services?
                </h3>
                <ChevronUp className="w-5 h-5 text-[#004D40]" />
              </div>
              <div className="p-6 bg-white border-t">
                <p className="text-gray-700">
                  We specialize in one-on-one, highly personalized tutoring that
                  goes beyond just helping students with homework. Our expert
                  tutors focus on mastery, confidence-building, and academic
                  strategy, ensuring that students not only improve their grades
                  but also develop lifelong learning skills.
                </p>
              </div>
            </div>

            {/* FAQ Item 2 - Collapsed */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
                <h3 className="font-medium text-[#004D40]">
                  Who are your tutors?
                </h3>
                <ChevronDown className="w-5 h-5 text-[#004D40]" />
              </div>
            </div>

            {/* FAQ Item 3 - Collapsed */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
                <h3 className="font-medium text-[#004D40]">
                  How do you match students with tutors?
                </h3>
                <ChevronDown className="w-5 h-5 text-[#004D40]" />
              </div>
            </div>

            {/* FAQ Item 4 - Collapsed */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 cursor-pointer bg-white">
                <h3 className="font-medium text-[#004D40]">
                  Do you offer in-person tutoring?
                </h3>
                <ChevronDown className="w-5 h-5 text-[#004D40]" />
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Link
                href="#"
                className="border border-[#004D40] text-[#004D40] px-8 py-3 rounded-full hover:bg-[#E8F5E9] transition"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tutor Recruitment Banner */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            Interested in becoming a tutor with Milestone Learning?
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto mb-8">
            Make a lasting impact—join a team where your expertise empowers
            students and your growth is supported every step of the way.
          </p>
          <Link
            href="#"
            className="inline-block bg-green-900 text-white px-8 py-3 rounded-full hover:bg-green-800 transition font-medium"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#004D40] text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-white font-serif text-2xl mb-4">
                Milestone <span className="text-gray-300">| Learning</span>
              </div>
              <p className="text-gray-300 mb-4">
                Personalized tutoring that empowers students to achieve academic
                excellence and build confidence.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons */}
                <Link href="#" className="text-white hover:text-gray-300">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {/* Icon placeholder */}
                  </div>
                </Link>
                <Link href="#" className="text-white hover:text-gray-300">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {/* Icon placeholder */}
                  </div>
                </Link>
                <Link href="#" className="text-white hover:text-gray-300">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {/* Icon placeholder */}
                  </div>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Become a Tutor
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Book a Consultation</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Book a Learning Session
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <Phone className="w-5 h-5 mr-2" />
                  XXX-XXX-XXXX
                </li>
                <li className="flex items-center text-gray-300">
                  <Mail className="w-5 h-5 mr-2" />
                  hello@milestonelearning.com
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 Milestone Learning. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-300 text-sm hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-300 text-sm hover:text-white">
                Terms of Services
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
