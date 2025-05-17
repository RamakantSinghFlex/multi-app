"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AcademicPerformance({ data }: { data: any }) {
  const router = useRouter()

  const fetchUrlAndRedirect = async (altText: string) => {
    const selectedCallToAction = data.callToActions.find((item: any) => {
      return item.label === altText
    })
    if (selectedCallToAction) {
      router.push(selectedCallToAction.url)
    }
  }

  return (
    <section className="py-16 bg-white px-4 md:px-16">
      <div className="w-full" data-aos="fade-up" data-aos-duration="1200">
        {/* Right column with three cards */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 justify-center">
          {/* Card 1 */}
          <div className="bg-white lg:col-span-1">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-green-900 leading-tight">
                {data.title}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">{data.description}</p>

                <Link
                  href="#"
                  className="inline-flex items-center text-green-800 font-medium hover:text-green-700 transition-colors"
                >
                  {data.callToActions[0].label}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="w-full flex items-center gap-6 overflow-x-auto lg:col-span-3">
            {data.images.map((image: any) => (
              <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 ml-auto"
                key={image.id}
              >
                <Image
                  src={image.image.url}
                  alt={image.altText}
                  width={288}
                  height={320}
                  className="min-w-72 min-h-80 object-cover rounded-t-2xl"
                />
                <div className="p-6">
                  <Button
                    className="w-full bg-primary text-white rounded-full py-6 cursor-pointer"
                    onClick={() => fetchUrlAndRedirect(image.altText)}
                  >
                    {image.altText}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
