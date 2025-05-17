import Image from "next/image"

export default function TutorsSection({ data }: { data: any }) {
  return (
    <section className="bg-white py-16">
      <div className="w-full text-center" data-aos="fade-up" data-aos-duration="1200">
        <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-12">{data.title}</h2>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {data.universityLogos.map((item: any) => (
            <div key={item.id} className="w-36 h-36 rounded-lg flex items-center justify-center shadow-md">
              <Image src={item.logo.url} alt={item.universityName} width={56} height={56} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
