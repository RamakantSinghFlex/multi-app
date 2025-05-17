// Dynamic Blog API for fetching content from the external API
import { createAuthHeaders } from "./api-utils"

export const BLOGS_API_URL = "https://ancient-yeti-453713-d0.uk.r.appspot.com/api/pages/681e095b767287dd8556100c?depth=1&draft=false&locale=undefined"

/**
 * Fetches all blog posts from the API
 */
export async function getBlogPosts() {
  try {
    const response = await fetch(BLOGS_API_URL, {
      method: "GET",
      next: { revalidate: 60 }
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
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching blog posts"
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
      next: { revalidate: 60 }
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
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching blog post"
    }
  }
}

/**
 * Process raw API data into structured blog posts
 * @param data The raw API response data
 * @returns Array of processed blog post objects
 */
function processBlogData(data: any): any[] {
  const blogPosts: any[] = []
  
  if (data.layout && Array.isArray(data.layout)) {
    // Filter out blocks that represent main blog articles
    // Look for blog entries with both title and services
    const mainBlogBlocks = data.layout.filter((block: any) => 
      block.blockType === "services" && 
      block.title && 
      (!block.title.includes("Bonus Tip") && 
       !block.title.includes("Looking for personalized") &&
       !block.title.includes("Benefits of") && 
       !block.title.includes("Potential Drawbacks") && 
       !block.title.includes("Which One's Better") &&
       !block.title.includes("help deciding") &&
       !block.title.includes("Practical Tips"))
    );
    
    // Process main blog blocks
    mainBlogBlocks.forEach((block: any, index: number) => {
      let title = block.title.replace(/^\d+\.\s*"|"$/g, '')
      // Clean up quotes from title if present
      if (title.startsWith('"')) {
        title = title.substring(1);
      }
      if (title.endsWith('"')) {
        title = title.substring(0, title.length - 1);
      }
      
      // Generate a clean slug from title
      let slug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      
      // Extract a potential number prefix for ordering
      const numMatch = block.title.match(/^(\d+)\./)
      const orderNumber = numMatch ? parseInt(numMatch[1]) : index + 1
      
      // Build content from intro and services
      let content = ''
      let excerpt = ''
      
      // Process the excerpt
      if (block.intro) {
        // Clean up description prefix if present
        excerpt = block.intro.replace(/^Description:\s*/, '')
        content += block.intro + "\n\n"
      }
      
      // Find all service blocks that belong to this blog by looking for related blocks
      // that might contain additional content for this blog post
      const relatedBlocks = findRelatedBlocks(data.layout, block, orderNumber);
      
      // Combine all services from main block and related blocks
      let allServices: any[] = [];
      
      // Add services from main block
      if (block.services && Array.isArray(block.services)) {
        allServices = [...block.services];
      }
      
      // Add services from related blocks
      relatedBlocks.forEach((relatedBlock: any) => {
        if (relatedBlock.services && Array.isArray(relatedBlock.services)) {
          allServices = [...allServices, ...relatedBlock.services];
        }
        
        // Add related block intros to content
        if (relatedBlock.intro) {
          content += `## ${relatedBlock.title}\n\n${relatedBlock.intro}\n\n`;
        }
      });
      
      // Process all services
      if (allServices.length > 0) {
        content += allServices.map((service: any) => {
          let serviceContent = ''
          if (service.serviceTitle) {
            serviceContent += `## ${service.serviceTitle}\n\n`
          }
          if (service.description) {
            serviceContent += service.description
          }
          return serviceContent
        }).join('\n\n')
      }
      
      if (block.id) {
        blogPosts.push({
          id: block.id,
          title: title,
          slug: slug,
          excerpt: excerpt || "",
          content: content,
          coverImage: "/placeholder.jpg",
          publishedAt: data.updatedAt || new Date().toISOString(),
          author: "Milestone Learning Team",
          readTime: Math.ceil(content.length / 1000),
          orderNumber: orderNumber
        })
      }
    })
  }
  
  return blogPosts
}

/**
 * Helper function to find related blocks for a main blog block
 */
function findRelatedBlocks(allBlocks: any[], mainBlock: any, orderNumber: number): any[] {
  // Find blocks that might be related to this main block based on title or order number
  return allBlocks.filter((block: any) => {
    if (block.id === mainBlock.id) return false; // Skip the main block itself
    
    // Look for blocks with the same number prefix
    if (block.title && block.title.match(new RegExp(`^${orderNumber}\\b`))) {
      return true;
    }
    
    // Look for blocks with related titles (removing quotes and numbers)
    const mainTitle = mainBlock.title.replace(/^\d+\.\s*"|"$/g, '').toLowerCase();
    const blockTitle = block.title ? block.title.replace(/^\d+\.\s*"|"$/g, '').toLowerCase() : '';
    
    // Check if titles are related
    if (blockTitle && 
        (blockTitle.includes(mainTitle) || 
         mainTitle.includes(blockTitle) ||
         // Look for blocks that contain parts of the main title
         mainTitle.split(' ').some((word: string) => word.length > 4 && blockTitle.includes(word)))) {
      return true;
    }
    
    return false;
  });
}

/**
 * Find a blog post by its slug
 */
function findBlogPostBySlug(blogPosts: any[], slug: string): any {
  const normalizedSlug = slug.toLowerCase().trim()
  
  // Direct match
  let blogPost = blogPosts.find(post => 
    post.slug.toLowerCase() === normalizedSlug
  )
  
  if (blogPost) return blogPost
  
  // Try without number prefix
  const prefixlessSlug = normalizedSlug.replace(/^\d+[-_]/, '')
  blogPost = blogPosts.find(post => 
    post.slug.toLowerCase() === prefixlessSlug || 
    post.slug.toLowerCase().replace(/^\d+[-_]/, '') === prefixlessSlug
  )
  
  if (blogPost) return blogPost
  
  // Try partial match
  blogPost = blogPosts.find(post => 
    normalizedSlug.includes(post.slug.toLowerCase()) || 
    post.slug.toLowerCase().includes(normalizedSlug)
  )
  
  if (blogPost) return blogPost
  
  // Try matching by number prefix if slug starts with a number
  const numPrefixMatch = normalizedSlug.match(/^(\d+)/)
  if (numPrefixMatch) {
    const numPrefix = numPrefixMatch[1]
    const matchingPosts = blogPosts.filter(post => post.title.startsWith(numPrefix))
    if (matchingPosts.length > 0) {
      return matchingPosts[0]
    }
  }
  
  return null
}
