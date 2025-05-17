import { getBlogPost } from "@/lib/blog-api-dynamic-new"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

interface BlogPostParams {
  params: {
    slug: string
  }
}

function formatBlogContent(content: string): string {
  if (!content) return ""

  let formattedContent = content
    .replace(/##\s*/g, "")
    .replace(/#\s*/g, "")
    .replace(/\n\n/g, "</p><div class='my-6'><p>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")

  return `<p class='mb-6'>${formattedContent}</p>`
}

export default async function BlogDetailPage({ params }: BlogPostParams) {
  const { slug } = params

  const response = await getBlogPost(slug)
  const blogPost = response.data?.docs?.[0]

  if (!blogPost) {
    notFound()
  }
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <Button
        variant="ghost"
        asChild
        className="mb-8 hover:bg-green-50 transition-colors"
      >
        <Link
          href="/blogs"
          className="flex items-center gap-2 text-green-700 hover:text-green-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all articles</span>
        </Link>
      </Button>
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-5">
          <span className="px-4 py-1.5 bg-green-700 text-white rounded-full font-semibold text-sm">
            #{blogPost.orderNumber}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mb-8">
          {blogPost.title}
        </h1>

        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          {blogPost.author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{blogPost.author}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(blogPost.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {blogPost.readTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{blogPost.readTime} min read</span>
            </div>
          )}
        </div>
      </div>
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-10 rounded-xl overflow-hidden">
        <Image
          src={blogPost.coverImage || "/placeholder.jpg"}
          alt={blogPost.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="prose prose-lg max-w-none prose-headings:text-green-900 prose-headings:mb-6 prose-headings:mt-8 prose-p:my-6 prose-p:leading-relaxed">
        <div
          dangerouslySetInnerHTML={{
            __html: formatBlogContent(blogPost.content),
          }}
        />
      </div>{" "}
      <div className="mt-20 pt-10 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-green-900 mb-8">
          More Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {response.data?.docs
            .filter((post: any) => post.slug !== params.slug)
            .slice(0, 2)
            .map((post: any) => (
              <Link
                href={`/blogs/${post.slug}`}
                key={post.id}
                className="group"
              >
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all hover:-translate-y-1 duration-300 p-5">
                  <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                    <Image
                      src={post.coverImage || "/placeholder.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-lg font-medium text-green-900 group-hover:text-green-700 transition-colors mb-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
