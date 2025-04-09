"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getContentByCollection } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { BookOpen, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { sanitizeHtml } from "@/lib/utils" // We'll create this utility

export default function CollectionPage() {
  const params = useParams()
  const slug = params.slug as string

  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await getContentByCollection(slug, currentPage, 12)

        if (response.data) {
          setContent(response.data.docs)
          setTotalPages(response.data.totalPages)
          setTotalItems(response.data.totalDocs)
        } else {
          throw new Error(response.error || "Failed to fetch content")
        }
      } catch (error) {
        console.error(`Error fetching content for collection ${slug}:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#02342e] capitalize md:text-3xl">{slug.replace(/-/g, " ")}</h1>
          <p className="text-[#9d968d]">
            {totalItems} {totalItems === 1 ? "item" : "items"} available
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-[#d9d9d9]">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <div className="aspect-video animate-pulse bg-[#e8e8e8]" />
                <CardContent className="p-4">
                  <div className="h-5 w-3/4 animate-pulse bg-[#e8e8e8]" />
                  <div className="mt-2 h-4 w-full animate-pulse bg-[#e8e8e8]" />
                  <div className="mt-1 h-4 w-2/3 animate-pulse bg-[#e8e8e8]" />
                </CardContent>
              </Card>
            ))}
        </div>
      ) : content.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {content.map((item) => (
              <Link key={item.id} href={`/content/${item.id}`}>
                <Card className="overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
                  <div className="aspect-video bg-[#e9f3f1]">
                    <Image
                      src={item.thumbnail || "/placeholder.svg?height=200&width=400"}
                      alt={item.title}
                      width={400}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-[#02342e]">{item.title}</h3>
                    {item.description && (
                      <div
                        className="mt-1 text-sm text-[#9d968d]"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(
                            item.description.length > 100
                              ? item.description.substring(0, 100) + "..."
                              : item.description,
                          ),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className={currentPage === page ? "bg-[#095d40] text-white hover:bg-[#02342e]" : ""}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center">
          <div className="rounded-full bg-[#eaf4ed] p-4 text-[#095d40]">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-[#02342e]">No content available</h3>
          <p className="mt-2 text-[#9d968d]">There are no items in this collection yet.</p>
          <Button className="mt-6 bg-[#095d40] hover:bg-[#02342e]">Browse Other Collections</Button>
        </div>
      )}
    </div>
  )
}
