import Image from "next/image"
import { Button } from "../ui/button"

export default function SuccessStoriesSection({ data }: { data: any }) {
  return (
    <section className="py-16 bg-gray-100 px-4 md:px-16">
      <div
        className="w-full space-y-12"
        data-aos="fade-up"
        data-aos-duration="1200"
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900">
            {data.title}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">{data.subtitle}</p>
        </div>

        <div className="w-full flex items-center overflow-x-auto gap-6">
          {data.successStories.map((story: any) => (
            <div
              key={story.id}
              className="min-w-72 min-h-80 bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="mb-4 text-green-700">
                <Image
                  src={data.quoteImage.url}
                  alt={data.quoteImage.alt}
                  width={36}
                  height={36}
                />
              </div>
              <p className="text-gray-700 mb-4">{story.quote}</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                  <Image
                    src={story.authorImage.url}
                    alt={story.authorImage.alt}
                    width={40}
                    height={40}
                  />
                </div>
                <div className="text-black">
                  <p className="font-medium">{story.authorName}</p>
                  <p className="text-sm text-gray-500">{story.authorRole}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            className="!border-green-900 !text-green-900 rounded-full cursor-pointer"
          >
            {data.viewAllButton.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
