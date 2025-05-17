// Dynamic Blog API for fetching content from the external API - simplified version

export const BLOGS_API_URL =
  "https://ancient-yeti-453713-d0.uk.r.appspot.com/api/pages/681e095b767287dd8556100c?depth=1&draft=false&locale=undefined"

interface BlogPost {
  category: string
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
    } // Get blog posts directly from the API with minimal processing
    const blogPosts = data.layout
      .filter((block: any) => block.title && block.intro)
      .map((block: any, index: number) => {
        const title = block.title.replace(/^\d+\.\s*"|"$/g, "").trim()
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")

        // Pre-process the content to remove markdown headers
        const cleanContent = (block.intro || "")
          .replace(/##\s*/g, "")
          .replace(/#\s*/g, "")

        return {
          id: block.id,
          title: title,
          slug: slug,
          excerpt: block.intro || title,
          content: cleanContent,
          coverImage: "/placeholder.jpg",
          publishedAt: data.updatedAt || new Date().toISOString(),
          author: "Milestone Learning Team",
          readTime: 5,
          orderNumber: index + 1,
        }
      })
      .sort((a: any, b: any) => a.orderNumber - b.orderNumber)

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

    // Get blog posts directly with minimal processing
    const blogPosts: BlogPost[] = data.layout
      .filter((block: any) => block.title && block.intro)
      .map((block: any, index: number) => {
        const title = block.title.replace(/^\d+\.\s*"|"$/g, "").trim()
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")

        // Pre-process the content to remove markdown headers
        const cleanContent = (block.intro || "")
          .replace(/##\s*/g, "")
          .replace(/#\s*/g, "")

        return {
          id: block.id,
          title: title,
          slug: slug,
          excerpt: block.intro || title,
          content: cleanContent,
          coverImage: "/placeholder.jpg",
          publishedAt: data.updatedAt || new Date().toISOString(),
          author: "Milestone Learning Team",
          readTime: 5,
          orderNumber: index + 1,
        }
      })
      .sort((a: any, b: any) => a.orderNumber - b.orderNumber)
    // Find the blog post by slug - simple matching
    const blogPost: BlogPost | undefined = blogPosts.find(
      (post) => post.slug.toLowerCase() === slug.toLowerCase()
    )

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
