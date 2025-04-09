// app/collections/[slug]/page.tsx

import type React from "react"

interface CollectionPageProps {
  params: {
    slug: string
  }
}

const CollectionPage: React.FC<CollectionPageProps> = ({ params }) => {
  const { slug } = params

  // Dummy data for demonstration purposes
  const collectionData = {
    name: `Collection: ${slug}`,
    description: `<p>This is a <strong>sample</strong> description for the ${slug} collection.</p> 
                    <p>It might contain HTML tags.</p>
                    <html><body>This should be removed</body></html>`,
    items: [
      {
        id: 1,
        name: "Item 1",
        description: `<p>Description for Item 1</p><html><body>This should be removed</body></html>`,
      },
      {
        id: 2,
        name: "Item 2",
        description: `<p>Description for Item 2</p><html><body>This should be removed</body></html>`,
      },
    ],
  }

  return (
    <div>
      <h1>{collectionData.name}</h1>
      <p
        dangerouslySetInnerHTML={{
          __html: collectionData.description
            ? collectionData.description
                .replace(/<html[^>]*>/gi, "")
                .replace(/<\/html>/gi, "")
                .replace(/<body[^>]*>/gi, "")
                .replace(/<\/body>/gi, "")
            : "No description available",
        }}
      />

      <h2>Items in this collection:</h2>
      <ul>
        {collectionData.items.map((item) => (
          <li key={item.id}>
            <h3>{item.name}</h3>
            <p
              dangerouslySetInnerHTML={{
                __html: item.description
                  ? item.description
                      .replace(/<html[^>]*>/gi, "")
                      .replace(/<\/html>/gi, "")
                      .replace(/<body[^>]*>/gi, "")
                      .replace(/<\/body>/gi, "")
                  : "No description available",
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollectionPage
