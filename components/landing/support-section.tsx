import Image from "next/image"

export default function SupportSection({ data }: { data: any }) {
  return (
    <section className="py-16 bg-gray-50 px-4 md:px-16">
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

        <div className="text-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.supportOptions.map((option: any) => (
            <div
              className="bg-white rounded-lg border border-gray-200 flex items-start"
              key={option.id}
            >
              <div className="h-full w-24 bg-[#EAF4ED] flex items-center justify-center flex-shrink-0">
                <Image
                  src={option.icon.url}
                  alt={option.icon.alt}
                  width={52}
                  height={52}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
