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
  
  // Fetch the blog post data using the slug from the URL
  const response = await getBlogPost(slug)
  
  // Get the blog post from the response
  const blogPost = response.data?.docs?.[0];
  
  // If blog post is not found, return 404
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

      {/* Featured image */}
      {blogPost.coverImage && (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-10 rounded-xl overflow-hidden">
          <Image
            src={blogPost.coverImage}
            alt={blogPost.title}
            fill
            className="object-cover"
          />
        </div>
      )}      {/* Blog content */}
      <div className="prose prose-lg max-w-none">
        {blogPost.content && (
          <div dangerouslySetInnerHTML={{ 
            __html: blogPost.content
              .replace(/\n\n/g, '</p><p>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
              .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
              .replace(/^(.*)$/m, '<p>$1</p>')
              .replace(/<p><h([1-6])>(.*?)<\/h\1><\/p>/g, '<h$1>$2</h$1>')
          }} />
        )}

        {!blogPost.content && blogPost.excerpt && (
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {blogPost.excerpt}
          </p>
        )}
      </div>

      {/* Call to action */}      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">Ready to support your child&apos;s learning journey?</h3>
          <p className="mb-6">Schedule a consultation with our academic experts to discuss your child&apos;s specific needs.</p>
          <Button asChild>
            <Link href="/contact">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
