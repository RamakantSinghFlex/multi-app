import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"

export default function Footer({ data }: { data: any }) {
  return (
    <footer className="bg-primary text-white py-16 px-4 md:px-16">
      <div className="w-full" data-aos="fade-up" data-aos-duration="1200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="w-fit flex flex-col items-center">
            <Image
              src={data.logo.url}
              alt={data.logo.alt}
              width={150}
              height={32}
              className="h-8"
            />
            <div className="flex gap-2 mt-4 justify-center">
              {data.socialLinks.map((link: any) => (
                <Link
                  key={link.id}
                  href={link.url}
                  className="text-white hover:text-green-200"
                >
                  {link.platform === "linkedin" && <Linkedin size={20} />}
                  {link.platform === "instagram" && <Instagram size={20} />}
                  {link.platform === "facebook" && <Facebook size={20} />}
                </Link>
              ))}
            </div>
          </div>

          <div>
            {data.navigationLinks.map((link: any) =>
              !link.isImportant ? (
                <li key={link.id} className="list-none mb-2">
                  <Link
                    href={link.url}
                    className="text-green-100 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ) : (
                <Button
                  className="bg-white hover:bg-gray-200 text-black uppercase text-sm mb-4 rounded-full w-fit px-4 py-2 cursor-pointer"
                  key={link.id}
                >
                  {link.label}
                </Button>
              )
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{data.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{data.contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-green-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-green-200">{data.copyrightText}</p>
          <div className="flex gap-6 text-sm text-green-200">
            {data.legalLinks.map((link: any) => (
              <Link key={link.id} href={link.url} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
