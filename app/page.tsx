"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { logger } from "@/lib/monitoring"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronRight, BookOpen, Award, Users } from "lucide-react"
import { motion } from "framer-motion"

// Define types for our API response
interface PageResponse {
  docs: Page[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface Page {
  createdAt: string;
  updatedAt: string;
  tenant: string;
  title: string;
  slug: string;
  layout: BlockType[];
  id: string;
}

// Block type interfaces
interface BlockType {
  blockType: string;
  position: string;
  [key: string]: any;
}

interface Step {
  stepTitle: string;
  stepDescription: string;
  icon: string | null;
  id?: string;
}

interface FAQ {
  question: string;
  answer: {
    root: {
      children: Array<{
        children: Array<{
          text: string;
          [key: string]: any;
        }> | [];
        [key: string]: any;
      }>;
      [key: string]: any;
    };
  };
  id?: string;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image: string | null;
  rating: number;
  id?: string;
}

interface Service {
  serviceTitle: string;
  description: string;
  icon: string | null;
  link: string;
  id?: string;
}

interface Subject {
  subjectName: string;
  subjectIcon: string | null;
  id?: string;
}

interface Feature {
  featureTitle: string;
  featureDescription: string;
  icon: string | null;
  id?: string;
}

// Mock data as fallback
const mockHomeData = {
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tenant: "tenant-id",
  title: "Home",
  slug: "home",
  id: "home-id",
  layout: [
    {
      blockType: 'hero',
      position: 'top',
      heading: 'Empowering Every Student',
      subheading: 'With Personalized Learning for Lasting Success',
      backgroundImage: null,
      cta: {
        label: 'Get Started',
        url: '/get-started',
      },
    },
    {
      blockType: 'process',
      position: 'middle',
      title: 'Know Our Process',
      description: 'The most successful learning is one-on-one...',
      steps: [
        {
          stepTitle: 'Consultation',
          stepDescription: 'We start with a deep consultation to understand your needs.',
          icon: null,
        },
        {
          stepTitle: 'Planning',
          stepDescription: 'Next, we plan and strategize together.',
          icon: null,
        },
        {
          stepTitle: 'Execution',
          stepDescription: 'Finally, we implement personalized learning strategies.',
          icon: null,
        },
      ],
    },
    {
      blockType: 'testimonials',
      position: 'middle',
      title: 'Success We Achieved Together',
      testimonials: [
        {
          name: 'Emma',
          role: 'K-12',
          quote: 'Before working with my tutor, math felt impossible...',
          image: null,
          rating: 5,
        },
      ],
    },
    {
      blockType: 'finalCTA',
      position: 'bottom',
      ctaHeading: 'Ready to Get Started?',
      ctaSubheading: 'Contact us today and take the first step.',
      ctaButton: {
        label: 'Book A Session',
        url: '/contact',
      },
    },
  ],
};

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [home, setHome] = useState<Page | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  
  // Additional check for valid authentication with proper optional chaining
  const isReallyAuthenticated = isAuthenticated && user && user.roles && Array.isArray(user.roles) && user.roles?.length > 0

  // Update hero block links to signin
  const updateHeroCtaLinks = (layout: BlockType[]): BlockType[] => {
    return layout.map(block => {
      if (block.blockType === 'hero' && block.cta) {
        return {
          ...block,
          cta: {
            ...block.cta,
            url: '/signup', // Change to /signup instead of /signin
          }
        };
      } else if (block.blockType === 'finalCTA' && block.ctaButton) {
        return {
          ...block,
          ctaButton: {
            ...block.ctaButton,
            url: '/signup', // Change to /signup for the finalCTA button as well
          }
        };
      }
      return block;
    });
  };

  useEffect(() => {
    if (!isLoading) {
      logger.info("Home page: Auth check complete", { 
        isAuthenticated: isAuthenticated, 
        user: user,
        hasRoles: user?.roles && Array.isArray(user?.roles) ? user.roles?.length > 0 : false
      })
      setPageLoading(false)
    }
  }, [isLoading, isAuthenticated, user])

  // Fetch landing page data
  useEffect(() => {
    async function fetchData() {
      try {
        // Try to fetch from API
        const response = await fetch('/api/proxy-landing-page', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API responded with ${response.status}: ${response.statusText}`);
        }
        
        const data: PageResponse = await response.json();
        
        // Find the home page data (looking for the "homelanding" slug or "home")
        const homePage = data.docs.find(page => 
          page.slug === 'homelanding' || page.slug === 'home'
        );
        
        if (homePage) {
          // Update the hero CTA links to point to /signin
          const updatedHomePage = {
            ...homePage,
            layout: updateHeroCtaLinks(homePage.layout)
          };
          setHome(updatedHomePage);
        } else {
          console.warn('Home page not found in API response, using mock data');
          // Update the mock data's hero CTA link as well
          const updatedMockData = {
            ...mockHomeData,
            layout: updateHeroCtaLinks(mockHomeData.layout)
          };
          setHome(updatedMockData as Page);
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
        
        // Use mock data as fallback, but update the hero CTA links
        console.log('Using mock data as fallback');
        const updatedMockData = {
          ...mockHomeData,
          layout: updateHeroCtaLinks(mockHomeData.layout)
        };
        setHome(updatedMockData as Page);
      } finally {
        setApiLoading(false);
      }
    }

    fetchData();
  }, []);

  // If there's an error during navigation
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="text-destructive">
          <p className="text-lg font-semibold">Navigation Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  // Show a loading state while checking authentication and fetching data
  if (pageLoading || apiLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!home) {
    return <div className="flex min-h-screen items-center justify-center">Error: Failed to load content</div>;
  }

  // Main page content
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Header with subtle shadow and blur effect */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/placeholder.svg?height=40&width=150&text=Milestone+Learning"
              alt="Milestone Learning Logo"
              width={150}
              height={40}
              className="h-auto w-auto"
            />
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 hover:text-gray-900" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button className="bg-[#095d40] hover:bg-[#02342e] shadow-sm transition-all duration-300 hover:shadow-md" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
          {isReallyAuthenticated && (
            <Button className="bg-[#095d40] hover:bg-[#02342e] shadow-sm transition-all duration-300 hover:shadow-md" asChild>
              <Link href={`/${user?.roles?.[0] || "dashboard"}/dashboard`} className="flex items-center">
                Go to Dashboard
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </nav>
      </header>

      <main>
        {home.layout.map((block, blockIndex) => {
          switch (block.blockType) {
            case 'hero':
              return (
                <section key={blockIndex} className="relative overflow-hidden bg-gradient-to-br from-[#f0f7f4] via-white to-[#eaf4ed] py-20 text-center md:py-32">
                  {/* Abstract background shapes */}
                  <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -right-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-[#eaf4ed]/50"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-[#eaf4ed]/30"></div>
                  </div>
                  
                  <div className="container mx-auto px-4">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-[#02342e] md:text-5xl lg:text-6xl">
                      {block.heading}
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
                      {block.subheading}
                    </p>
                    <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                      <Button 
                        size="lg" 
                        className="bg-[#095d40] px-8 py-6 text-lg shadow-lg transition-all duration-300 hover:bg-[#02342e] hover:shadow-xl"
                        asChild
                      >
                        <Link href="/signup" className="flex items-center">
                          {block.cta?.label || "Get Started"}
                          <ChevronRight className="ml-2 h-5 w-5" />  
                        </Link>
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-[#095d40] px-8 py-6 text-lg text-[#095d40] transition-colors hover:bg-[#eaf4ed]"
                        asChild
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </div>
                  </div>
                </section>
              )

            case 'process':
              const processBlock = block as BlockType & { steps?: Step[], title: string, description: string };
              return (
                <section key={blockIndex} className="bg-white py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                      <h2 className="mb-6 text-3xl font-bold text-[#02342e] md:text-4xl">
                        {processBlock.title}
                      </h2>
                      <p className="text-lg text-gray-600">
                        {processBlock.description}
                      </p>
                    </div>
                    <div className="grid gap-10 md:grid-cols-3">
                      {processBlock.steps?.map((step: Step, stepIndex: number) => (
                        <div key={stepIndex} className="group relative rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
                          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf4ed] text-[#095d40] transition-colors group-hover:bg-[#095d40] group-hover:text-white">
                            <span className="text-2xl font-bold">{stepIndex + 1}</span>
                          </div>
                          <h3 className="mb-4 text-xl font-bold text-[#02342e]">{step.stepTitle}</h3>
                          <p className="text-gray-600">{step.stepDescription}</p>
                          <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#095d40] transition-all duration-300 group-hover:w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )

            case 'faq':
              const faqBlock = block as BlockType & { faqs?: FAQ[], title: string };
              return (
                <section key={blockIndex} className="bg-gray-50 py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                      <h2 className="mb-6 text-3xl font-bold text-[#02342e] md:text-4xl">
                        {faqBlock.title}
                      </h2>
                    </div>
                    <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm md:p-8">
                      <Accordion type="single" collapsible className="w-full">
                        {faqBlock.faqs?.map((faq: FAQ, faqIndex: number) => (
                          <AccordionItem key={faqIndex} value={`item-${faqIndex}`} className="border-b border-gray-200 py-2 last:border-0">
                            <AccordionTrigger className="text-left text-lg font-medium text-gray-800 hover:text-[#095d40]">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              {faq.answer.root.children.map((child: any, childIndex: number) => 
                                child.children && child.children.length > 0 ? (
                                  <p key={childIndex} className="mb-4 last:mb-0">
                                    {child.children[0]?.text}
                                  </p>
                                ) : null
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </section>
              )

            case 'testimonials':
              const testimonialBlock = block as BlockType & { testimonials?: Testimonial[], title: string };
              return (
                <section key={blockIndex} className="bg-white py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                      <h2 className="mb-6 text-3xl font-bold text-[#02342e] md:text-4xl">
                        {testimonialBlock.title}
                      </h2>
                    </div>
                    <div className="mx-auto max-w-4xl">
                      <div className="grid gap-8 md:grid-cols-1">
                        {testimonialBlock.testimonials?.map((testimonial: Testimonial, testimonialIndex: number) => (
                          <Card key={testimonialIndex} className="overflow-hidden border-0 bg-[#f9fcfa] shadow-sm transition-all duration-300 hover:shadow-md">
                            <CardContent className="p-8">
                              <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                                <div className="mb-6 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-muted shadow-sm md:mb-0 md:mr-8">
                                  {testimonial.image ? (
                                    <Image
                                      src={testimonial.image}
                                      alt={testimonial.name}
                                      width={80}
                                      height={80}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[#095d40] text-white">
                                      {testimonial.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="mb-3 flex justify-center md:justify-start">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                  </div>
                                  <blockquote className="mb-6 text-lg italic text-gray-700">"{testimonial.quote}"</blockquote>
                                  <div>
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )

            case 'services':
              const servicesBlock = block as BlockType & { services?: Service[], title: string, intro: string };
              return (
                <section key={blockIndex} className="bg-gray-50 py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                      <h2 className="mb-4 text-3xl font-bold text-[#02342e] md:text-4xl">
                        {servicesBlock.title}
                      </h2>
                      <p className="text-lg text-gray-600">
                        {servicesBlock.intro}
                      </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
                      {servicesBlock.services?.map((service: Service, serviceIndex: number) => (
                        <Link key={serviceIndex} href={service.link} className="group">
                          <div className="h-full rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-[#095d40]/20 hover:shadow-md">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf4ed] text-[#095d40] transition-colors group-hover:bg-[#095d40] group-hover:text-white">
                              {serviceIndex === 0 ? (
                                <BookOpen className="h-7 w-7" />
                              ) : (
                                <Award className="h-7 w-7" />
                              )}
                            </div>
                            <h3 className="mb-4 text-xl font-bold text-gray-900 group-hover:text-[#095d40]">
                              {service.serviceTitle}
                            </h3>
                            <p className="mb-6 text-gray-600">{service.description}</p>
                            <div className="flex items-center text-[#095d40]">
                              <span className="font-medium">Learn more</span>
                              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )

            case 'subjects':
              const subjectsBlock = block as BlockType & { subjects?: Subject[] };
              return (
                <section key={blockIndex} className="bg-white py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                      <h2 className="mb-6 text-3xl font-bold text-[#02342e] md:text-4xl">
                        Subjects We Teach
                      </h2>
                      <p className="text-lg text-gray-600">
                        Our experienced tutors specialize in a wide range of subjects to help you excel.
                      </p>
                    </div>
                    <div className="mx-auto max-w-5xl grid-cols-2 gap-6 space-y-0 sm:grid-cols-3 md:grid md:grid-cols-6">
                      {subjectsBlock.subjects?.map((subject: Subject, subjectIndex: number) => (
                        <div key={subjectIndex} className="group flex flex-col items-center rounded-lg p-4 transition-colors hover:bg-[#f9fcfa]">
                          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf4ed] text-[#095d40] transition-colors group-hover:bg-[#095d40] group-hover:text-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                            </svg>
                          </div>
                          <span className="text-center font-medium text-gray-800 group-hover:text-[#095d40]">
                            {subject.subjectName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )

            case 'features':
              const featuresBlock = block as BlockType & { features?: Feature[], title: string };
              return (
                <section key={blockIndex} className="bg-gray-50 py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                      <h2 className="mb-6 text-3xl font-bold text-[#02342e] md:text-4xl">
                        {featuresBlock.title}
                      </h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3 lg:gap-10">
                      {featuresBlock.features?.map((feature: Feature, featureIndex: number) => (
                        <div 
                          key={featureIndex} 
                          className="group rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-[#095d40]/20 hover:shadow-md"
                        >
                          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf4ed] text-[#095d40] transition-colors group-hover:bg-[#095d40] group-hover:text-white">
                            {featureIndex === 0 ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M5 12h14"></path>
                                <path d="M12 5v14"></path>
                              </svg>
                            ) : featureIndex === 1 ? (
                              <Users className="h-6 w-6" />
                            ) : (
                              <Award className="h-6 w-6" />
                            )}
                          </div>
                          <h3 className="mb-4 text-xl font-bold text-gray-900">{feature.featureTitle}</h3>
                          <p className="text-gray-600">{feature.featureDescription}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )

            case 'finalCTA':
              const ctaBlock = block as BlockType & { 
                ctaHeading: string, 
                ctaSubheading: string, 
                ctaButton?: { 
                  label: string, 
                  url: string 
                } 
              };
              return (
                <section key={blockIndex} className="relative overflow-hidden bg-gradient-to-r from-[#095d40] to-[#02342e] py-20 text-white md:py-32">
                  {/* Background pattern */}
                  <div className="absolute inset-0 -z-10 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#dotPattern)" />
                    </svg>
                  </div>
                  <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-6 text-3xl font-bold md:text-4xl">{ctaBlock.ctaHeading}</h2>
                    <p className="mx-auto mb-10 max-w-2xl text-xl opacity-90">{ctaBlock.ctaSubheading}</p>
                    <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                      <Button 
                        size="lg"
                        className="bg-white px-8 py-6 text-lg text-[#095d40] shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl"
                        asChild
                      >
                        <Link href="/signup" className="flex items-center">
                          {ctaBlock.ctaButton?.label || "Get Started"}
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white px-8 py-6 text-lg text-white transition-colors hover:bg-white/10"
                        asChild
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </div>
                  </div>
                </section>
              )

            default:
              return null
          }
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">About Us</h3>
              <p className="text-gray-600">
                Milestone Learning provides personalized tutoring services to help students achieve their academic goals.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/" className="hover:text-[#095d40]">One-on-One Tutoring</Link></li>
                <li><Link href="/" className="hover:text-[#095d40]">Test Preparation</Link></li>
                <li><Link href="/" className="hover:text-[#095d40]">Academic Coaching</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/" className="hover:text-[#095d40]">Blog</Link></li>
                <li><Link href="/" className="hover:text-[#095d40]">FAQ</Link></li>
                <li><Link href="/" className="hover:text-[#095d40]">Student Resources</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">Contact</h3>
              <ul className="space-y-2 text-gray-600">
                <li>info@milestonelearning.com</li>
                <li>(555) 123-4567</li>
                <li>123 Education Lane, Learning City</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between border-t border-gray-200 pt-8 md:flex-row">
            <p className="mb-4 text-sm text-gray-500 md:mb-0">
              © {new Date().getFullYear()} Milestone Learning. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-[#095d40]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#095d40]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#095d40]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
