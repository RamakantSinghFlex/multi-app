"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { getMediaUrl } from "@/lib/api/media"

const Confirmation = () => {
  const router = useRouter()
  const confirmationImageUrl = getMediaUrl("confirmation-illustration.png")

  return (
    <div className="min-h-screen flex justify-center items-center px-6 py-12">
      <div className="w-full max-w-[710px] flex flex-col items-center text-center gap-6">
        {/* Illustration */}
        <div className="relative w-[200px] h-[200px] md:w-[250px] md:h-[250px]">
          <Image
            src={confirmationImageUrl}
            alt="Confirmation Success"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-[40px] leading-[54px] font-poppins font-semibold text-[#02342E] text-center">
          You&apos;re all set.
        </h2>

        {/* Paragraph */}
        <p className="text-[14px] text-[#1D1D1D] font-lato leading-6 max-w-[600px]">
          You are now welcome to explore our platform. Our team is currently
          analyzing your information to provide you with the most suitable tutor
          recommendations for your child’s academic growth. We will contact you
          with these recommendations soon.
        </p>

        {/* Confirm Button */}
        <button
          onClick={() => router.push("/")}
          className="bg-[#02342E] text-white px-10 py-2 rounded-full hover:bg-[#012c27] mt-2"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

export default Confirmation
