import type { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()
    if (!slug) {
      return new Response("No slug provided", { status: 400 })
    }
    // Revalidate home page if slug is "home"
    if (slug === "home") {
      revalidatePath("/", "page")
    }
    // Revalidate the path
    revalidatePath(`/${slug}`, "page")
    return new Response("Revalidation successful: " + slug, { status: 200 })
  } catch (error) {
    console.error("Error during revalidation", error)
    return new Response("Revalidation failed", { status: 500 })
  }
}
