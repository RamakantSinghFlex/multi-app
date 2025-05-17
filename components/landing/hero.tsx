"use client"

import { Check } from "lucide-react"
import { Button } from "../ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Hero({ data }: { data: any }) {
  const router = useRouter()

  return (
    <section className="w-full bg-white mx-auto">
      <div className="w-full flex flex-col md:grid md:grid-cols-2 md:items-center">
        {/* Image container - full width on mobile, half width on desktop */}
        <div className="relative w-full h-64 md:h-full md:order-2">
          <Image
            src={data.backgroundImage.url || "/placeholder.svg"}
            alt={data.backgroundImage.alt}
            fill
            className="object-cover"
          />
        </div>

        {/* Content container - stacked below image on mobile */}
        <div className="space-y-6 py-8 px-6 bg-gray-50 md:bg-white md:py-16 md:px-16 md:order-1">
          <h1 className="text-3xl font-bold text-green-900 leading-tight">
            {data.heading}
          </h1>
          <ul className="text-black space-y-4">
            {data.keypoints.map((point: { text: string; id: string }) => (
              <li className="flex items-center gap-3" key={point.id}>
                <div className="h-6 w-6 rounded-full bg-green-900 flex items-center justify-center p-1 flex-shrink-0">
                  <Check size={16} color="white" />
                </div>
                <span className="text-sm md:text-base">{point.text}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full bg-primary text-white py-3 px-6 rounded-full cursor-pointer md:w-auto md:px-8"
            asChild
            onClick={() => {
              router.push(data.cta.url)
            }}
          >
            <Link href={data.cta.url}>{data.cta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
