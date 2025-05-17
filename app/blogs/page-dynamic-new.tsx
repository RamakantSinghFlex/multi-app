// Dynamic implementation for blog listing page
import { getBlogPosts } from "@/lib/blog-api-dynamic-new"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock } from "lucide-react"

export default async function BlogsPage() {
  // Fetch blog posts from the dynamic API
  const response = await getBlogPosts()
  // Blog posts are already sorted by orderNumber in the API function
  const blogPosts = response.data?.docs || []

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mb-4">
          Milestone Learning Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Educational insights and resources to support your child&apos;s
          learning journey
        </p>
      </div>{" "}
      {/* Featured post - First post in numerical order (1. Title) */}
      {blogPosts.length > 0 && (
        <div className="mb-16">
          <Link href={`/blogs/${blogPosts[0].slug}`} className="group">
            <div className="grid md:grid-cols-5 gap-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative h-64 md:h-auto md:col-span-2">
                <Image
                  src={blogPosts[0].coverImage || "/placeholder.jpg"}
                  alt={blogPosts[0].title}
                  fill
                  className="object-cover"
                />
                {/* Show order number badge */}
                <div className="absolute top-3 left-3 bg-green-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  #{blogPosts[0].orderNumber}
                </div>
              </div>
              <div className="p-6 md:col-span-3 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(blogPosts[0].publishedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{blogPosts[0].readTime} min read</span>
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-900 group-hover:text-green-700 transition-colors mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {blogPosts[0].excerpt}
                </p>
                <span className="text-green-700 font-medium group-hover:underline mt-auto">
                  Read full article
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}{" "}
      {/* Grid of blog posts - Remaining posts in numerical order (2. Title, 3. Title, etc.) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.slice(1).map((post) => (
          <Link href={`/blogs/${post.slug}`} key={post.id} className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
              <div className="relative h-48 w-full">
                <Image
                  src={post.coverImage || "/placeholder.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                {/* Order number badge */}
                <div className="absolute top-3 left-3 bg-green-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  #{post.orderNumber}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-green-900 group-hover:text-green-700 transition-colors mb-2">
                  {post.title}
                </h2>

                <p className="text-muted-foreground mb-4 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-auto flex justify-between items-center">
                  <span className="text-green-700 font-medium group-hover:underline">
                    Read more
                  </span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime} min
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
