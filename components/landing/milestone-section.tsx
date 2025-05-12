import Image from "next/image"
import { Button } from "../ui/button"

export default function MilestoneSection({ data }: { data: any }) {
  return (
    <section
      className="py-16 px-4 md:px-16 bg-green-900 text-white"
      style={{
        background: `url(${data.backgroundImage.url})`,
        backgroundColor: "rgba(2, 52, 46, 0.5)", // Adds a semi-transparent black overlay
        backgroundBlendMode: "multiply",
      }}
    >
      <div className="w-full" data-aos="fade-up" data-aos-duration="1200">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{data.title}</h2>
        </div>

        <div className="flex flex-wrap gap-6 justify-center mb-6">
          {data.features.map((feature: any) => (
            <div
              className="bg-white p-8 rounded-lg text-center text-gray-800 w-72"
              key={feature.id}
            >
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center">
                  <Image
                    src={feature.icon.url}
                    width={56}
                    height={56}
                    alt={feature.icon.alt}
                  />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-3">{feature.featureTitle}</h3>
              <p className="text-gray-600 text-sm">
                {feature.featureDescription}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          {data.callToActions.map((cta: any) => (
            <Button
              key={cta.id}
              variant="outline"
              className={`text-black cursor-pointer rounded-full ${cta.isPrimary ? "bg-white" : "bg-primary text-white"}`}
            >
              {cta.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
