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

    // Process and sort blog posts by their orderNumber (numerical prefix)
    const blogPosts = processBlogData(data).sort(
      (a, b) => a.orderNumber - b.orderNumber
    )
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

    // Process and sort blog posts to maintain consistent ordering
    const blogPosts = processBlogData(data).sort(
      (a, b) => a.orderNumber - b.orderNumber
    )
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
        if (
          block.title.includes("Bonus Tip") ||
          block.title.includes("Benefits") ||
          block.title.includes("Drawbacks") ||
          block.title.includes("Practical Tips")
        ) {
          fullContent += `## ${block.title}\n\n${block.intro}\n\n`
        }
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
      blogPosts.push({
        id: mainBlock.id,
        title,
        slug,
        excerpt: excerpt || title,
        content: fullContent,
        coverImage: "/placeholder.jpg", // Use default placeholder
        publishedAt: data.updatedAt || new Date().toISOString(),
        author: "Milestone Learning Team",
        readTime: Math.ceil(fullContent.length / 1000) || 5,
        orderNumber,
      })
    }
  })

  return blogPosts
}

/**
 * Find a blog post by its slug
 */
function findBlogPostBySlug(
  blogPosts: BlogPost[],
  slug: string
): BlogPost | null {
  const normalizedSlug = slug.toLowerCase().trim()

  // Direct match
  let blogPost = blogPosts.find(
    (post) => post.slug.toLowerCase() === normalizedSlug
  )

  if (blogPost) return blogPost

  // Try without number prefix
  const prefixlessSlug = normalizedSlug.replace(/^\d+[-_]/, "")
  blogPost = blogPosts.find(
    (post) =>
      post.slug.toLowerCase() === prefixlessSlug ||
      post.slug.toLowerCase().replace(/^\d+[-_]/, "") === prefixlessSlug
  )

  if (blogPost) return blogPost

  // Try partial match
  blogPost = blogPosts.find(
    (post) =>
      normalizedSlug.includes(post.slug.toLowerCase()) ||
      post.slug.toLowerCase().includes(normalizedSlug)
  )

  if (blogPost) return blogPost

  // Try matching by number prefix if slug starts with a number
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

  return null
}
