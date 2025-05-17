// Dynamic implementation for blog post detail page
import { getBlogPost } from "@/lib/blog-api-dynamic-new"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowUpRight, Calendar, Clock, User } from "lucide-react"

interface BlogPostParams {
  params: {
    slug: string
  }
}

/**
 * Format blog content for HTML display
 * This properly handles markdown-style formatting in the content
 */
function formatBlogContent(content: string): string {
  if (!content) return ""

  // Process markdown elements
  let formattedContent = content
    // Handle paragraphs
    .replace(/\n\n/g, "</p><p class='mb-6 leading-relaxed'>")
    // Handle bold text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Handle headers
    .replace(
      /^## (.*?)$/gm,
      "</p><h2 class='text-2xl font-bold text-green-800 mt-10 mb-4'>$1</h2><p class='mb-6 leading-relaxed'>"
    )
    .replace(
      /^# (.*?)$/gm,
      "</p><h1 class='text-3xl font-bold text-green-900 mt-12 mb-6'>$1</h1><p class='mb-6 leading-relaxed'>"
    )
    // Handle line breaks
    .replace(/\n/g, "<br>")
    // Handle lists
    .replace(
      /^\* (.*?)$/gm,
      "</p><ul class='list-disc pl-6 mb-6'><li class='mb-2'>$1</li></ul><p class='mb-6 leading-relaxed'>"
    )
    .replace(
      /<\/ul><p class='mb-6 leading-relaxed'>\s*<ul class='list-disc pl-6 mb-6'>/g,
      ""
    )
    .replace(
      /<\/li><\/ul><p class='mb-6 leading-relaxed'>\s*<ul class='list-disc pl-6 mb-6'>/g,
      "</li>"
    )
    // Handle blockquotes
    .replace(
      /^> (.*?)$/gm,
      "</p><blockquote class='border-l-4 border-green-200 pl-4 italic my-6 text-gray-700'>$1</blockquote><p class='mb-6 leading-relaxed'>"
    )

  // Wrap in paragraph tags with styling
  formattedContent = `<p class='mb-6 leading-relaxed'>${formattedContent}</p>`

  // Clean up duplicate paragraph tags
  formattedContent = formattedContent
    .replace(/<p class='mb-6 leading-relaxed'><\/p>/g, "")
    .replace(/<p class='mb-6 leading-relaxed'><h([1-6])/g, "<h$1")
    .replace(/<\/h([1-6])><\/p>/g, "</h$1>")

  return formattedContent
}

export default async function BlogDetailPage({ params }: BlogPostParams) {
  const { slug } = params

  // Fetch the blog post data using the slug from the URL
  const response = await getBlogPost(slug)
  const blogPost = response.data?.docs?.[0]

  // If blog post is not found, return 404
  if (!blogPost) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6 hover:bg-green-50">
          <Link
            href="/blogs"
            className="flex items-center gap-1 text-green-700 hover:text-green-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all articles</span>
          </Link>
        </Button>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            {blogPost.orderNumber && (
              <span className="px-3 py-1 bg-green-700 text-white rounded-full font-semibold">
                #{blogPost.orderNumber}
              </span>
            )}
            <span className="text-green-700 font-medium">
              {blogPost.category || "Education"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mb-6 leading-tight">
            {blogPost.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-8 border-b border-gray-100 pb-6">
            {blogPost.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{blogPost.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(
                  blogPost.publishedAt || Date.now()
                ).toLocaleDateString("en-US", {
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

          {/* Featured image */}
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-10 rounded-xl overflow-hidden">
            <Image
              src={blogPost.coverImage || "/placeholder.jpg"}
              alt={blogPost.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Blog excerpt/introduction */}
          {blogPost.excerpt && (
            <div className="mb-8">
              <p className="text-xl text-gray-700 leading-relaxed italic border-l-4 border-green-200 pl-4 py-2">
                {blogPost.excerpt}
              </p>
            </div>
          )}

          {/* Blog content */}
          <article className="prose prose-lg max-w-none prose-headings:text-green-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold">
            <div
              dangerouslySetInnerHTML={{
                __html: formatBlogContent(blogPost.content),
              }}
            />
          </article>
        </div>

        {/* Related articles section */}
        <div className="mt-16 pt-8">
          <h3 className="text-2xl font-bold text-green-900 mb-6">
            More Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {response.data?.docs
              .filter((post: any) => post.slug !== params.slug)
              .slice(0, 2)
              .map((post: any) => (
                <Link
                  href={`/blogs/${post.slug}`}
                  key={post.id}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 hover:border-green-200">
                    <div className="relative h-44 w-full mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={post.coverImage || "/placeholder.jpg"}
                        alt={post.title}
                        fill
                        className="object-cover rounded transition-transform duration-500 group-hover:scale-105"
                      />
                      {post.orderNumber && (
                        <div className="absolute top-2 left-2 bg-green-700 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          #{post.orderNumber}
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-green-900 group-hover:text-green-700 transition-colors text-lg mb-2">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.readTime || 5} min read</span>
                      <ArrowUpRight className="h-4 w-4 text-green-700" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
