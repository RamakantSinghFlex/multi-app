import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { Marquee } from "../magicui/marquee"
// Import from dynamic blog API
import { getBlogPosts } from "@/lib/blog-api-dynamic"

export default async function InsightsSection({ data }: { data: any }) {
  // Fetch blog posts dynamically
  const blogResponse = await getBlogPosts()
  const blogPosts = blogResponse.data?.docs || []
  return (
    <section className="py-16 bg-gray-50 px-4 md:px-16">
      <div className="w-full">
        <div className="space-y-6 text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900">
            {data.title}
          </h2>
          <p className="text-gray-700 text-lg">{data.subtitle}</p>
        </div>{" "}
        <div className="relative w-full mb-10">
          <Marquee>
            {data.articles.map((article: any) => {
              // Match this article with a dynamic blog post if possible
              const matchingBlog = blogPosts.find(
                (post) =>
                  post.title === article.title ||
                  post.title.includes(article.title) ||
                  article.title.includes(post.title)
              )

              // Create a slug for the article, preferring the matching blog's slug
              const slug =
                matchingBlog?.slug ||
                article.slug ||
                article.title
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/\s+/g, "-")

              return (
                <Link
                  href={`/blogs/${slug}`}
                  key={article.id}
                  className="block cursor-pointer"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 w-[280px] md:w-[320px] snap-start transition-all duration-200 hover:shadow-md">
                    <div className="relative h-48">
                      <Image
                        src={
                          article.image?.url ||
                          matchingBlog?.coverImage ||
                          "/placeholder.jpg"
                        }
                        alt={
                          article.image?.alt ||
                          matchingBlog?.title ||
                          "Blog image"
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-4">
                      <h3 className="font-bold text-green-900">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {article.description ||
                          matchingBlog?.excerpt ||
                          data.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-green-900 font-medium text-sm">
                            {data.category}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {article.readTime || matchingBlog?.readTime || 5}{" "}
                            mins read
                          </span>
                        </div>
                        <div className="cursor-pointer">
                          <ArrowUpRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </Marquee>
        </div>
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-full px-16 py-2 h-auto !border-gray-300 !text-gray-700 !hover:bg-gray-50 cursor-pointer"
          >
            {data.viewAllButton.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
