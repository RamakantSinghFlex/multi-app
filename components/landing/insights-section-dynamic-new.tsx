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
  if (!title) return ""
  // Remove quotes and fix formatting for titles like '1. "Title"'
  return title.replace(/^(\d+)\.\s*"?(.+?)"?$/, "$2").trim()
}

// Helper function to extract blog number from title
function extractBlogNumber(title: string): number | null {
  if (!title) return null
  const match = title.match(/^(\d+)\./)
  return match ? parseInt(match[1]) : null
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
    allBlogPosts.forEach((post) => {
      if (post.orderNumber >= 1 && post.orderNumber <= 5) {
        // Only replace existing entry if this one has more content
        if (
          !blogsByNumber[post.orderNumber] ||
          (post.content &&
            (!blogsByNumber[post.orderNumber].content ||
              post.content.length >
                blogsByNumber[post.orderNumber].content.length))
        ) {
          blogsByNumber[post.orderNumber] = {
            ...post,
            // Make sure all required fields are present
            title: post.title || `Blog Post ${post.orderNumber}`,
            excerpt: post.excerpt || "",
            content: post.content || "",
          }
        }
      }
    })

    // Then, look for blog posts with a number in their title if any are missing
    allBlogPosts.forEach((post) => {
      const numberFromTitle = extractBlogNumber(post.title)
      if (numberFromTitle && numberFromTitle >= 1 && numberFromTitle <= 5) {
        // Only replace existing entry if this one has more content or if no entry exists
        if (
          !blogsByNumber[numberFromTitle] ||
          (post.content &&
            (!blogsByNumber[numberFromTitle].content ||
              post.content.length >
                blogsByNumber[numberFromTitle].content.length))
        ) {
          blogsByNumber[numberFromTitle] = {
            ...post,
            // Ensure all required fields are present
            title: post.title || `Blog Post ${numberFromTitle}`,
            excerpt: post.excerpt || "",
            content: post.content || "",
          }
        }
      }
    })

    // Create the final array of exactly 5 blog posts
    const result: any[] = []

    // Helper to process services and related content for a blog post
    const processFullBlogContent = (post: any, number: number) => {
      // Get the content for this blog post
      let fullContent = post.content || post.excerpt || ""

      // If the fullContent is too short, try to find more content by parsing the original data
      if (fullContent.length < 200 && allBlogPosts.length > 0) {
        // Look for all content blocks with this blog number
        const relatedBlocks = allBlogPosts.filter((blogPost) => {
          const postNumber = extractBlogNumber(blogPost.title)
          return postNumber === number
        })

        // If we found related blocks, combine their content in a structured way
        if (relatedBlocks.length > 0) {
          // Create content sections by block type
          const sections: Record<string, string[]> = {
            main: [],
            benefits: [],
            drawbacks: [],
            tips: [],
          }

          // Collect content by section type
          relatedBlocks.forEach((block) => {
            let sectionType = "main"

            if (block.title) {
              const title = block.title.toLowerCase()
              if (title.includes("benefits")) sectionType = "benefits"
              else if (title.includes("drawbacks")) sectionType = "drawbacks"
              else if (title.includes("tips") || title.includes("bonus"))
                sectionType = "tips"
            }

            // Add block content to appropriate section
            let blockContent = ""
            if (block.intro) blockContent += block.intro + "\n\n"
            if (block.content) blockContent += block.content + "\n\n"

            if (blockContent) sections[sectionType].push(blockContent)
          })

          // Build the full content with sections
          fullContent = ""

          // Main content first
          if (sections.main.length > 0) {
            fullContent += sections.main.join("\n\n") + "\n\n"
          }

          // Add titled sections if they have content
          if (sections.benefits.length > 0) {
            fullContent +=
              "## Benefits\n\n" + sections.benefits.join("\n\n") + "\n\n"
          }

          if (sections.drawbacks.length > 0) {
            fullContent +=
              "## Drawbacks\n\n" + sections.drawbacks.join("\n\n") + "\n\n"
          }

          if (sections.tips.length > 0) {
            fullContent +=
              "## Tips and Bonus Information\n\n" +
              sections.tips.join("\n\n") +
              "\n\n"
          }

          // Process all services from all blocks
          const allServices = relatedBlocks.flatMap((block) =>
            block.services && Array.isArray(block.services)
              ? block.services
              : []
          )

          if (allServices.length > 0) {
            fullContent += allServices
              .map((service: any) => {
                let serviceContent = ""
                if (service.serviceTitle) {
                  serviceContent += `## ${service.serviceTitle}\n\n`
                }
                if (service.description) {
                  serviceContent += service.description
                }
                return serviceContent
              })
              .join("\n\n")
          }
        }
      }

      // Extract a proper excerpt if not available
      const excerpt = post.excerpt || fullContent.substring(0, 150) + "..."

      return {
        ...post,
        blogNumber: number,
        orderNumber: number,
        content: fullContent,
        // Ensure we have all the required fields
        id: post.id || `blog-${number}`,
        title: post.title || `${number}. Blog Post ${number}`,
        slug: post.slug || `blog-${number}`,
        excerpt: excerpt,
        coverImage: post.coverImage || "/placeholder.jpg",
        readTime: post.readTime || Math.ceil(fullContent.length / 1000) || 5,
      }
    }

    // Ensure we have 5 blog posts in the correct order
    for (let i = 1; i <= 5; i++) {
      const post = blogsByNumber[i]
      if (post) {
        result.push(processFullBlogContent(post, i))
      } else {
        // Create a placeholder if needed
        result.push({
          id: `placeholder-${i}`,
          title: `${i}. Blog Post ${i}`,
          slug: `blog-${i}`,
          excerpt: "Content coming soon...",
          content: "Full content will be available soon.",
          blogNumber: i,
          orderNumber: i,
          coverImage: "/placeholder.jpg",
          readTime: 5,
        })
      }
    }

    return result
  }

  // Get all 5 blog posts, ensuring we have one for each position
  const completeBlogPosts = getBlogPosts15()

  // Map these to display articles with proper structure for rendering
  const displayArticles = completeBlogPosts.map((blog) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    orderNumber: blog.orderNumber,
    blogNumber: blog.blogNumber,
    image: {
      url: blog.coverImage || "/placeholder.jpg",
      alt: blog.title || `Blog ${blog.blogNumber}`,
    },
    readTime: blog.readTime || 5,
    excerpt:
      blog.excerpt ||
      blog.content?.substring(0, 150) + "..." ||
      "Learn more about this topic...",
    content: blog.content || "",
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
                      {/* Use blog excerpt or first part of content if available */}
                      {article.excerpt ||
                        article.content?.substring(0, 120) + "..." ||
                        "Learn more about this topic..."}
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
