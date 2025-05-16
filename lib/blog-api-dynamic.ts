// Dynamic Blog API for fetching content from the external API
import { createAuthHeaders } from "./api-utils"

export const BLOGS_API_URL =
  "https://ancient-yeti-453713-d0.uk.r.appspot.com/api/pages/681e095b767287dd8556100c?depth=1&draft=false&locale=undefined"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  publishedAt: string
  author: string
  readTime: number
  orderNumber: number
}

/**
 * Fetches all blog posts from the API
 */
export async function getBlogPosts() {
  try {
    const response = await fetch(BLOGS_API_URL, {
      method: "GET",
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Error fetching blog posts: ${response.status}`)
    }

    const data = await response.json()

    if (!data || !data.layout) {
      throw new Error("Invalid blog data format")
    }

    const blogPosts = processBlogData(data)
    return { data: { docs: blogPosts } }
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching blog posts",
    }
  }
}

/**
 * Fetches a single blog post by slug
 */
export async function getBlogPost(slug: string) {
  try {
    const response = await fetch(BLOGS_API_URL, {
      method: "GET",
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Error fetching blog post: ${response.status}`)
    }

    const data = await response.json()

    if (!data || !data.layout) {
      throw new Error("Invalid blog data format")
    }

    const blogPosts = processBlogData(data)
    const blogPost = findBlogPostBySlug(blogPosts, slug)

    if (blogPost) {
      return { data: { docs: [blogPost] } }
    } else {
      return { data: { docs: [] } }
    }
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching blog post",
    }
  }
}

/**
 * Groups related blog blocks based on their numerical prefix
 */
function groupRelatedBlocks(blocks: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {}

  // First, find main blog entries (those with numbers in title)
  blocks.forEach((block: any) => {
    if (!block.title) return

    // Extract number from titles like "1. Title" or "1. "Title""
    const match = block.title.match(/^(\d+)\./)
    if (match) {
      const postNumber = match[1]
      if (!groups[postNumber]) {
        groups[postNumber] = []
      }
      groups[postNumber].push(block)
    }
  })

  // Then assign other related blocks to their groups
  blocks.forEach((block: any) => {
    if (!block.title) return

    // Skip blocks already assigned to a group
    const alreadyAssigned = Object.values(groups).some((group) =>
      group.some((groupBlock) => groupBlock.id === block.id)
    )

    if (alreadyAssigned) return

    // Look for related blocks based on title content
    for (const [key, group] of Object.entries(groups)) {
      const mainBlock = group[0]
      const mainTitle = mainBlock.title
        .replace(/^\d+\.\s*"|"$/g, "")
        .toLowerCase()
        .trim()

      const blockTitle = block.title.toLowerCase()

      // Check if this block should be part of this group
      if (
        blockTitle.includes(mainTitle) ||
        // Check for sub-sections with same number
        blockTitle.startsWith(`${key}.`) ||
        // Check for related content blocks
        (block.blockType === "services" &&
          (blockTitle.includes("benefits") ||
            blockTitle.includes("drawbacks") ||
            blockTitle.includes("tips") ||
            blockTitle.includes("bonus")))
      ) {
        group.push(block)
        break
      }
    }
  })

  return groups
}

/**
 * Process raw API data into structured blog posts
 */
function processBlogData(data: any): BlogPost[] {
  const blogPosts: BlogPost[] = []

  if (!data.layout || !Array.isArray(data.layout)) return blogPosts

  // Group the blog blocks by their numerical prefix
  const blogGroups = groupRelatedBlocks(data.layout)

  // Process each group to create a blog post
  Object.entries(blogGroups).forEach(([key, blocks], index) => {
    // Find the main block that contains the title and main content
    const mainBlock =
      blocks.find(
        (block) => block.title && block.title.match(/^(\d+)\.\s*"(.+?)"$/)
      ) || blocks[0]

    if (!mainBlock || !mainBlock.title) return

    // Clean up title - remove number prefix and quotes
    let title = mainBlock.title.replace(/^\d+\.\s*"|"$/g, "").trim()

    // Remove any remaining quotes
    if (title.startsWith('"')) title = title.substring(1)
    if (title.endsWith('"')) title = title.substring(0, title.length - 1)

    // Create a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")

    // Get order number for sorting
    const orderNumber = parseInt(key) || index + 1

    // Extract excerpt from the main block intro
    let excerpt = ""
    if (mainBlock.intro) {
      excerpt = mainBlock.intro.replace(/^Description:\s*/i, "")
    }

    // Build content from all related blocks
    let fullContent = ""

    // Start with main block intro
    if (mainBlock.intro) {
      fullContent += mainBlock.intro + "\n\n"
    }

    // Collect all services from all blocks
    const allServices: any[] = []

    // Process all blocks in this group
    blocks.forEach((block) => {
      // Add section headers for subsidiary blocks
      if (block !== mainBlock && block.intro) {
        // Check for common section header patterns
        if (
          block.title.includes("Bonus Tip") ||
          block.title.includes("Benefits") ||
          block.title.includes("Drawbacks") ||
          block.title.includes("Practical Tips") ||
          block.title.includes("Summary") ||
          block.title.includes("Example") ||
          block.title.includes("Case Study") ||
          block.title.toLowerCase().includes("how to") ||
          block.title.toLowerCase().includes("why")
        ) {
          // Format as a section header
          fullContent += `## ${block.title}\n\n${block.intro}\n\n`
        }
      }

      // Process any media content if available
      if (block.media && Array.isArray(block.media) && block.media.length > 0) {
        block.media.forEach((media: any) => {
          if (media.url) {
            // Add image with alt text to the content
            fullContent += `![${media.alt || block.title}](${media.url})\n\n`
          }
        })
      }

      // Collect services from all blocks
      if (block.services && Array.isArray(block.services)) {
        allServices.push(...block.services)
      }
    })

    // Add all services content
    if (allServices.length > 0) {
      fullContent += allServices
        .map((service) => {
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

    // Only create blog posts with enough content
    if (title && fullContent) {
      // Look for a cover image in any of the blocks
      let coverImage = "/placeholder.jpg"

      // Try to find a cover image from media in any block
      for (const block of blocks) {
        if (
          block.media &&
          Array.isArray(block.media) &&
          block.media.length > 0
        ) {
          const media = block.media.find(
            (m: any) =>
              m.url &&
              (m.url.endsWith(".jpg") ||
                m.url.endsWith(".png") ||
                m.url.endsWith(".jpeg"))
          )

          if (media && media.url) {
            coverImage = media.url
            break
          }
        }
      }

      // Calculate read time based on content length (approx. 200 words per minute)
      const wordCount = fullContent.split(/\s+/).length
      const readTime = Math.max(Math.ceil(wordCount / 200), 1)

      blogPosts.push({
        id: mainBlock.id,
        title,
        slug,
        excerpt: excerpt || title,
        content: fullContent,
        coverImage: coverImage,
        publishedAt: data.updatedAt || new Date().toISOString(),
        author: "Milestone Learning Team",
        readTime,
        orderNumber,
      })
    }
  })

  return blogPosts
}

/**
 * Find a blog post by its slug
 */
/**
 * Find a blog post by its slug using multiple matching strategies
 * This makes the URL routing more resilient to slight variations in slugs
 */
function findBlogPostBySlug(
  blogPosts: BlogPost[],
  slug: string
): BlogPost | null {
  if (
    !slug ||
    typeof slug !== "string" ||
    !blogPosts ||
    !Array.isArray(blogPosts)
  ) {
    return null
  }

  const normalizedSlug = slug.toLowerCase().trim()

  // Strategy 1: Direct exact match (most precise)
  let blogPost = blogPosts.find(
    (post) => post.slug.toLowerCase() === normalizedSlug
  )

  if (blogPost) return blogPost

  // Strategy 2: Match without numerical prefix
  // For URLs like "1-blog-post" matching a slug "blog-post"
  const prefixlessSlug = normalizedSlug.replace(/^\d+[-_]/, "")
  blogPost = blogPosts.find(
    (post) =>
      post.slug.toLowerCase() === prefixlessSlug ||
      post.slug.toLowerCase().replace(/^\d+[-_]/, "") === prefixlessSlug
  )

  if (blogPost) return blogPost

  // Strategy 3: Title-based matching for very clean URLs
  // that may have been manually typed or shared
  blogPost = blogPosts.find((post) => {
    const cleanTitle = post.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return cleanTitle === normalizedSlug
  })

  if (blogPost) return blogPost

  // Strategy 4: Partial match when slug is contained in each other
  blogPost = blogPosts.find(
    (post) =>
      normalizedSlug.includes(post.slug.toLowerCase()) ||
      post.slug.toLowerCase().includes(normalizedSlug)
  )

  if (blogPost) return blogPost

  // Strategy 5: Match by numerical prefix if slug starts with a number
  const numPrefixMatch = normalizedSlug.match(/^(\d+)/)
  if (numPrefixMatch) {
    const numPrefix = numPrefixMatch[1]
    const matchingPosts = blogPosts.filter(
      (post) =>
        post.title.startsWith(numPrefix) ||
        String(post.orderNumber) === numPrefix
    )
    if (matchingPosts.length > 0) {
      return matchingPosts[0]
    }
  }

  // Strategy 6: As a final fallback, try to match by similarity of title/slug
  const bestMatch = blogPosts.reduce(
    (best, post) => {
      // Simple similarity check - count matching characters
      const similarity = [...normalizedSlug].filter((char) =>
        post.slug.includes(char)
      ).length
      return similarity > best.similarity ? { post, similarity } : best
    },
    { post: null as BlogPost | null, similarity: 0 }
  )

  // Only return if we have a reasonable match (more than 60% of characters matching)
  if (bestMatch.post && bestMatch.similarity > normalizedSlug.length * 0.6) {
    return bestMatch.post
  }

  return null
}
