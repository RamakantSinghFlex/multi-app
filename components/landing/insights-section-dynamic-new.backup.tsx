// Dynamic implementation for insights section
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { Marquee } from "../magicui/marquee"
// Import from dynamic blog API
import { getBlogPosts } from "@/lib/blog-api-dynamic-new"

// Helper function to clean up blog titles and extract the number
function cleanBlogTitle(title: string): string {
  if (!title) return "";
  // Remove quotes and fix formatting for titles like '1. "Title"'
  return title.replace(/^(\d+)\.\s*"?(.+?)"?$/, "$1. $2").trim();
}

// Helper function to extract blog number from title
function extractBlogNumber(title: string): number | null {
  if (!title) return null;
  const match = title.match(/^(\d+)\./);
  return match ? parseInt(match[1]) : null;
}

export default async function InsightsSection({ data }: { data: any }) {
  // Fetch blog posts dynamically
  const blogResponse = await getBlogPosts()
  const allBlogPosts = blogResponse.data?.docs || []
  
  // Function to ensure we have complete blog posts for all 5 positions
  const getBlogPosts15 = () => {
    // Create a map of all available blog posts by number
    const blogsByNumber: Record<number, any> = {}
    
    // First, identify blog posts with explicit orderNumber (most reliable)
    allBlogPosts.forEach(post => {
      if (post.orderNumber >= 1 && post.orderNumber <= 5) {
        blogsByNumber[post.orderNumber] = post
      }
    })
    
    // Then, look for blog posts with a number in their title if any are missing
    if (Object.keys(blogsByNumber).length < 5) {
      allBlogPosts.forEach(post => {
        const numberFromTitle = extractBlogNumber(post.title)
        if (numberFromTitle && numberFromTitle >= 1 && numberFromTitle <= 5 && !blogsByNumber[numberFromTitle]) {
          blogsByNumber[numberFromTitle] = post
        }
      })
    }
    
    // Create the final array of exactly 5 blog posts
    const result: any[] = []
    
    // Ensure we have 5 blog posts in the correct order
    for (let i = 1; i <= 5; i++) {
      const post = blogsByNumber[i]
      if (post) {
        result.push({
          ...post,
          blogNumber: i,
          orderNumber: i
        })
      } else {
        // Create a placeholder if needed
        result.push({
          id: `placeholder-${i}`,
          title: `${i}. Blog Post ${i}`,
          slug: `blog-${i}`,
          excerpt: "Content coming soon...",
          blogNumber: i,
          orderNumber: i,
          coverImage: "/placeholder.jpg",
          readTime: 5
        })
      }
    }
    
    return result
  }

  // Get all 5 blog posts, ensuring we have one for each position
  const completeBlogPosts = getBlogPosts15()

  // Map these to display articles with proper structure
  const displayArticles = orderedBlogPosts.map(blog => ({
    id: blog.id || `blog-${blog.blogNumber}`,
    title: blog.title || `Blog ${blog.blogNumber}`,
    slug: blog.slug || `blog-post-${blog.blogNumber}`,
    orderNumber: blog.blogNumber,
    blogNumber: blog.blogNumber,
    image: {
      url: blog.coverImage || "/placeholder.jpg",
      alt: blog.title || `Blog ${blog.blogNumber}`
    },
    readTime: blog.readTime || 5,
    excerpt: blog.excerpt || ""
  }))
  return (
    <section className="py-16 bg-gray-50 px-4 md:px-16">
      <div className="w-full">
        <div className="space-y-6 text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900">
            {data.title || "Insights & Inspiration"}
          </h2>
          <p className="text-gray-700 text-lg">
            {data.subtitle ||
              "Educational resources to support your child's learning journey"}
          </p>
        </div>

        <div className="relative w-full mb-10">
          <Marquee>
            {displayArticles.map((article: any) => (
              <Link
                href={`/blogs/${article.slug}`}
                key={article.id}
                className="block cursor-pointer"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 w-[280px] md:w-[320px] snap-start transition-all duration-200 hover:shadow-md">
                  <div className="relative h-48">
                    <Image
                      src={article.image.url || "/placeholder.jpg"}
                      alt={article.image.alt || article.title}
                      fill
                      className="object-cover"
                    />
                    {/* Display blog order number */}
                    {article.orderNumber && (
                      <div className="absolute top-3 left-3 bg-green-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        #{article.orderNumber}
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-green-900 line-clamp-3 h-[4.5rem]">
                      {/* Display clean title without number prefix duplication */}
                      {cleanBlogTitle(article.title)}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-green-900 font-medium text-sm">
                          {data.category || "Education"}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {article.readTime} mins read
                        </span>
                      </div>
                      <div className="cursor-pointer">
                        <ArrowUpRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Marquee>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-full px-16 py-2 h-auto !border-gray-300 !text-gray-700 !hover:bg-gray-50 cursor-pointer"
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
