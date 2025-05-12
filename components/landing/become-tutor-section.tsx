import { Button } from "../ui/button"

export default function BecomeTutorSection({ data }: { data: any }) {
  return (
    <section className="py-16 bg-gray-100 px-4 md:px-16">
      <div
        className="w-full text-center space-y-6"
        data-aos="fade-up"
        data-aos-duration="1200"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-green-900">
          {data.title}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{data.description}</p>
        <Button className="bg-primary rounded-full px-12 text-white cursor-pointer">
          {data.buttonText}
        </Button>
      </div>
    </section>
  )
}
