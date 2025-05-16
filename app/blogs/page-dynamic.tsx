import { getBlogPosts } from "@/lib/blog-api-dynamic"
import Link from "next/link"
import Image from "next/image"
import { Calendar } from "lucide-react"

export default async function BlogsPage() {
  const response = await getBlogPosts()
  const blogPosts = response.data?.docs || []

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mb-4">
          Milestone Learning Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Educational insights and resources to support your child's learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post: any) => (
          <Link href={`/blogs/${post.slug}`} key={post.id} className="group">
            <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
              <div className="relative h-48 w-full">
                <Image
                  src={post.coverImage || "/placeholder.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-green-900 group-hover:text-green-700 transition-colors mb-2">
                  {post.title}
                </h2>
                
                <p className="text-muted-foreground mb-4 flex-1">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto">
                  <span className="text-green-700 font-medium group-hover:underline">
                    Read more
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
