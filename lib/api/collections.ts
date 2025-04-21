import { handleResponse } from "@/lib/api-utils";

export async function getContentByCollection(collectionSlug: string, page = 1, limit = 10) {
  try {
    // This is a placeholder implementation
    // In a real app, you would fetch from your API
    const mockResponse = {
      docs: Array(limit)
        .fill(0)
        .map((_, i) => ({
          id: `item-${i}`,
          title: `Content Item ${i + 1}`,
          description: `This is a description for content item ${i + 1} in the ${collectionSlug} collection.`,
          thumbnail: `/placeholder.svg?height=200&width=400&text=Item ${i + 1}`,
          updatedAt: new Date().toISOString(),
        })),
      totalDocs: 24,
      totalPages: 3,
      page,
    }

    return handleResponse({ data: mockResponse })
  } catch (error) {
    return handleResponse({ error: error instanceof Error ? error.message : "Failed to fetch collection content" })
  }
}

export async function getContentById(collection: string, id: string) {
  try {
    // This is a placeholder implementation
    // In a real app, you would fetch from your API
    const mockResponse = {
      id,
      title: `Content Item ${id}`,
      description: `This is a description for content item ${id} in the ${collection} collection.`,
      content: `
        <h2>Introduction</h2>
        <p>This is the introduction to the content. It provides an overview of what will be covered.</p>
        <h3>Key Concepts</h3>
        <ul>
          <li>First key concept</li>
          <li>Second key concept</li>
          <li>Third key concept</li>
        </ul>
        <h2>Main Content</h2>
        <p>This is the main content section. It goes into detail about the topic.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <h3>Subsection</h3>
        <p>This is a subsection of the main content.</p>
        <h2>Conclusion</h2>
        <p>This is the conclusion of the content. It summarizes what was covered.</p>
      `,
      thumbnail: `/placeholder.svg?height=400&width=800&text=Content ${id}`,
      collectionId: collection,
      updatedAt: new Date().toISOString(),
    }

    return handleResponse({ data: mockResponse })
  } catch (error) {
    return handleResponse({ error: error instanceof Error ? error.message : "Failed to fetch content" })
  }
}
