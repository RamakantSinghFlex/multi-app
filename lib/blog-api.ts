import { createAuthHeaders } from "./api-utils"

export const BLOGS_API_URL = "https://ancient-yeti-453713-d0.uk.r.appspot.com/api/pages/681e095b767287dd8556100c?depth=1&draft=false&locale=undefined"

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

function processBlogData(data: any) {
  const blogPosts: any[] = []
  
  if (data.layout && Array.isArray(data.layout)) {
    data.layout.forEach((block: any, index: number) => {
      if (block.blockType === "services" && block.title) {
        const title = block.title.replace(/^[0-9]+\.\s*"|"$/g, '')
        
        let content = ''
        
        if (block.intro) {
          content += block.intro + "\n\n"
        }
        
        if (block.services && Array.isArray(block.services)) {
          content += block.services.map((service: any) => {
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
        
        let slug = title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        
        if (block.id) {
          blogPosts.push({
            id: block.id,
            title: title,
            slug: slug,
            excerpt: block.intro || "",
            content: content,
            coverImage: "/placeholder.jpg",
            publishedAt: data.updatedAt || new Date().toISOString(),
            author: "Milestone Learning Team",
            readTime: Math.ceil(content.length / 1000)
          })
        }
      }
    })
  }
  
  return blogPosts
}

function findBlogPostBySlug(blogPosts: any[], slug: string) {
  const normalizedSlug = slug.toLowerCase().trim()
  
  let blogPost = blogPosts.find(post => 
    post.slug.toLowerCase() === normalizedSlug
  )
  
  if (blogPost) return blogPost
  
  const prefixlessSlug = normalizedSlug.replace(/^\d+[-_]/, '')
  blogPost = blogPosts.find(post => 
    post.slug.toLowerCase() === prefixlessSlug || 
    post.slug.toLowerCase().replace(/^\d+[-_]/, '') === prefixlessSlug
  )
  
  if (blogPost) return blogPost
  
  blogPost = blogPosts.find(post => 
    normalizedSlug.includes(post.slug.toLowerCase()) || 
    post.slug.toLowerCase().includes(normalizedSlug)
  )
  
  if (blogPost) return blogPost
  
  if (/^\d+/.test(normalizedSlug)) {
    const numPrefix = normalizedSlug.match(/^(\d+)/)?.[1]
    if (numPrefix) {
      const matchingPosts = blogPosts.filter(post => post.title.startsWith(numPrefix))
      if (matchingPosts.length > 0) {
        return matchingPosts[0]
      }
    }
  }
  
  return null
}
