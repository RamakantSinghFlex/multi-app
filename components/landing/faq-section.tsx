import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"

export default function FAQSection({ data }: any) {
  return (
    <section className="py-16 bg-white text-black px-4 md:px-16">
      <div
        className="w-full grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-16"
        data-aos="fade-up"
        data-aos-duration="1200"
      >
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-4">
            {data.title}
          </h2>
          <div>
            <p className="text-gray-600 mb-4 w-4/5">{data.description}</p>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <div>
            <Accordion type="single" collapsible className="w-full">
              {data.faqs.map((faq: any, index: number) => (
                <AccordionItem value={`item-${index + 1}`} key={faq.id}>
                  <AccordionTrigger className="text-left text-lg cursor-pointer">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="w-4/5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
