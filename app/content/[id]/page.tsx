interface Content {
  id: string
  title: string
  content: string
  description?: string
}

interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getContent(id: string): Promise<Content> {
  // Replace with your actual API endpoint
  const res = await fetch(`https://your-api.com/content/${id}`)

  if (!res.ok) {
    throw new Error("Failed to fetch content")
  }

  return res.json()
}

export default async function ContentPage({ params }: Props) {
  const { id } = params
  const content = await getContent(id)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
      <div className="prose max-w-none text-[#2c2c2c]">
        {content.content ? (
          <div
            dangerouslySetInnerHTML={{
              __html: content.content
                .replace(/<html[^>]*>/gi, "")
                .replace(/<\/html>/gi, "")
                .replace(/<body[^>]*>/gi, "")
                .replace(/<\/body>/gi, ""),
            }}
          />
        ) : (
          <div>
            <h2>About this content</h2>
            <p>{content.description || "No description available."}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
            <h3>Learning Objectives</h3>
            <ul>
              <li>Understand the core concepts</li>
              <li>Apply knowledge to real-world scenarios</li>
              <li>Develop critical thinking skills</li>
              <li>Master advanced techniques</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
