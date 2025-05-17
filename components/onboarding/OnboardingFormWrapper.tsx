"use client"

import React from "react"
import { getMediaUrl } from "@/lib/api/media"

type Props = {
  imageName: string
  stepIndex: number
  children: React.ReactNode
}

const OnboardingFormWrapper = ({ imageName, stepIndex, children }: Props) => {
  const backgroundImageUrl = getMediaUrl(imageName)

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Image for desktop */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12">
        {/* Progress Bar: only for steps 1, 2, 3 */}
        {stepIndex >= 0 && stepIndex <= 2 && (
          <div className="flex gap-4 mb-8 w-full max-w-[440px] justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex-1 h-[6px] rounded-[8px] ${
                  i <= stepIndex ? "bg-[#095D40]" : "bg-[#D9D9D9]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default OnboardingFormWrapper
