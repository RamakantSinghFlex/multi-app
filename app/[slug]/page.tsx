import { RenderBlock } from "@/components/render-block"
import { getPageData } from "@/lib/api/pages"
import { notFound } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pagesData = await getPageData(slug)

  // Not found page if slug is not found
  if (pagesData.data && pagesData.data.docs.length === 0) {
    return notFound()
  }

  // Get the page data
  const data = pagesData.data.docs.find((page: any) => page.slug === slug)

  // Not found page if slug is not found
  if (!data) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      {data.layout.map((layout: any) => (
        <RenderBlock layout={layout} key={layout.id} />
      ))}
    </div>
  )
}
