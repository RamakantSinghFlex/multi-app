
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { Marquee } from "../magicui/marquee"
import { getBlogPosts } from "@/lib/blog-api-dynamic-new"

function cleanBlogTitle(title: string): string {
  if (!title) return ""
  return title.replace(/^(\d+)\.\s*"?(.+?)"?$/, "$2").trim()
}

function extractBlogNumber(title: string): number | null {
  if (!title) return null
  const match = title.match(/^(\d+)\./)
  return match ? parseInt(match[1]) : null
}

export default async function InsightsSection({ data }: { data: any }) {
  const blogResponse = await getBlogPosts()
  const allBlogPosts = blogResponse.data?.docs || []

  const getBlogPosts15 = () => {
    const blogsByNumber: Record<number, any> = {}

    allBlogPosts.forEach((post) => {
      if (post.orderNumber >= 1 && post.orderNumber <= 5) {
        blogsByNumber[post.orderNumber] = post
      }
    })

    if (Object.keys(blogsByNumber).length < 5) {
      allBlogPosts.forEach((post) => {
        const numberFromTitle = extractBlogNumber(post.title)
        if (
          numberFromTitle &&
          numberFromTitle >= 1 &&
          numberFromTitle <= 5 &&
          !blogsByNumber[numberFromTitle]
        ) {
          blogsByNumber[numberFromTitle] = post
        }
      })
    }

    const result: any[] = []

    for (let i = 1; i <= 5; i++) {
      const post = blogsByNumber[i]
      if (post) {
        result.push({
          ...post,
          blogNumber: i,
          orderNumber: i,
        })
      } else {
        result.push({
          id: `placeholder-${i}`,
          title: `${i}. Blog Post ${i}`,
          slug: `blog-${i}`,
          excerpt: "Content coming soon...",
          blogNumber: i,
          orderNumber: i,
          coverImage: "/placeholder.jpg",
          readTime: 5,
        })
      }
    }

    return result
  }

  const completeBlogPosts = getBlogPosts15()
  const displayArticles = completeBlogPosts.map((blog) => ({
    id: blog.id || `blog-${blog.blogNumber}`,
    title: blog.title || `Blog ${blog.blogNumber}`,
    slug: blog.slug || `blog-post-${blog.blogNumber}`,
    orderNumber: blog.blogNumber,
    blogNumber: blog.blogNumber,
    image: {
      url: blog.coverImage || "/placeholder.jpg",
      alt: blog.title || `Blog ${blog.blogNumber}`,
    },
    readTime: blog.readTime || 5,
    excerpt: blog.excerpt || "",
    publishedAt: blog.publishedAt || blog.createdAt || new Date().toISOString(),
  }))
  return (
    <section className="py-20 bg-gray-50 px-4 md:px-16">
      <div className="w-full max-w-7xl mx-auto">
        {/* Section heading removed as requested */}
        <div className="relative w-full mb-12">
          <Marquee>
            {displayArticles.map((article: any) => (
              <Link
                href={`/blogs/${article.slug}`}
                key={article.id}
                className="block cursor-pointer"
              >
                {" "}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 w-[280px] md:w-[320px] h-[420px] snap-start transition-all duration-300 hover:shadow-md hover:border-green-200 hover:-translate-y-1 flex flex-col">
                  <div className="relative h-[180px] w-full overflow-hidden">
                    <Image
                      src={article.image.url || "/placeholder.jpg"}
                      alt={article.image.alt || article.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>{" "}
                  <div className="px-6 pt-4 pb-6 flex flex-col flex-grow">
                    {" "}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {article.readTime || 5} min read
                      </span>
                    </div>
                    <h3 className="font-bold text-green-900 text-lg mb-2 line-clamp-2">
                      {cleanBlogTitle(article.title)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-medium text-green-600 hover:text-green-700">
                        Read more
                      </span>
                      <div>
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Marquee>
        </div>{" "}
        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            className="rounded-full px-16 py-2 h-auto border-green-600 text-green-700 hover:bg-green-50 cursor-pointer transition-all duration-300 hover:border-green-400"
            asChild
          >
            <Link href="/blogs">
              {data.viewAllButton?.label || "View All Articles"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
