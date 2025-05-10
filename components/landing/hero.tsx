"use client"

import { Check } from "lucide-react"
import { Button } from "../ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Hero({ data }: { data: any }) {
  return (
    <section className="w-full bg-white mx-auto">
      <div className="w-full grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-6 py-16 px-4 md:px-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 leading-tight">
            {data.heading}
          </h1>
          <ul className="text-black space-y-2">
            {data.keypoints.map((point: { text: string; id: string }) => (
              <li className="flex items-center gap-2" key={point.id}>
                <div className="h-5 w-5 rounded-full bg-green-700 flex items-center justify-center p-1">
                  <Check size={16} color="white" />
                </div>
                <span>{point.text}</span>
              </li>
            ))}
          </ul>
          <Button
            className="bg-primary text-white px-8 rounded-full cursor-pointer"
            asChild
          >
            <Link href={data.cta.url}>{data.cta.label}</Link>
          </Button>
        </div>
        <div className="relative h-full">
          <Image
            src={data.backgroundImage.url}
            alt={data.backgroundImage.alt}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
