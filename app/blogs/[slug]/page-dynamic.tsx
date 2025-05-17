import { getBlogPost } from "@/lib/blog-api-dynamic"
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

export default async function BlogDetailPage({ params }: BlogPostParams) {
  const { slug } = params;
  
  const response = await getBlogPost(slug)
  const blogPost = response.data?.docs?.[0]

  if (!blogPost) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/blogs" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all articles</span>
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-900 mb-6">
          {blogPost.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
          {blogPost.author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{blogPost.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          {blogPost.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{blogPost.readTime} min read</span>
            </div>
          )}
        </div>
      </div>

      {blogPost.coverImage && (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-10 rounded-xl overflow-hidden">
          <Image
            src={blogPost.coverImage}
            alt={blogPost.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: formatBlogContent(blogPost.content) }} />
      </div>

      <div className="mt-16 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-green-900 mb-6">More Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {response.data?.docs
            .filter((post: any) => post.slug !== params.slug)
            .slice(0, 2)
            .map((post: any) => (
              <Link href={`/blogs/${post.slug}`} key={post.id} className="group">
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
                  <div className="relative h-40 w-full mb-4">
                    <Image
                      src={post.coverImage || "/placeholder.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <h4 className="font-medium text-green-900 group-hover:text-green-700 transition-colors">
                    {post.title}
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
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

function formatBlogContent(content: string): string {
  if (!content) return '';
  
  let formattedContent = content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
    
  return `<p>${formattedContent}</p>`;
}
