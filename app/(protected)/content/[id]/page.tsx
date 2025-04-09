"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getContentById } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Clock, Download, Share2, Bookmark } from "lucide-react"
import Image from "next/image"
import { sanitizeHtml } from "@/lib/utils" // We'll create this utility

export default function ContentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [content, setContent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        // Assuming we know which collection this content belongs to
        // In a real app, you might need to query multiple collections or have a unified endpoint
        const response = await getContentById("content", id)
        if (response.data) {
          setContent(response.data)
        } else {
          throw new Error(response.error || "Failed to fetch content")
        }
      } catch (error) {
        console.error(`Error fetching content with ID ${id}:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [id])

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="mb-4 text-[#095d40] hover:bg-[#eaf4ed] hover:text-[#095d40]"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {loading ? (
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-[#e8e8e8]" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-[#e8e8e8]" />
          <div className="aspect-video animate-pulse rounded-lg bg-[#e8e8e8]" />
        </div>
      ) : content ? (
        <>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#02342e] md:text-3xl">{content.title}</h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-sm text-[#9d968d]">
                <Clock className="mr-1 h-4 w-4" />
                {new Date(content.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-[#9d968d]">
                <BookOpen className="mr-1 h-4 w-4" />
                {content.collectionId || "General"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-[#d9d9d9] text-[#2c2c2c]">
              <Bookmark className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" className="border-[#d9d9d9] text-[#2c2c2c]">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="border-[#d9d9d9] text-[#2c2c2c]">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            {content.thumbnail && (
              <div className="aspect-video w-full bg-[#e9f3f1]">
                <Image
                  src={content.thumbnail || "/placeholder.svg?height=400&width=800"}
                  alt={content.title}
                  width={800}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <Tabs defaultValue="content" className="p-6">
              <TabsList className="bg-[#f5f5f5]">
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]"
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  value="discussion"
                  className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]"
                >
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <div className="prose max-w-none text-[#2c2c2c]">
                  {content.content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(content.content),
                      }}
                    />
                  ) : (
                    <div>
                      <h2>About this content</h2>
                      <p>{content.description || "No description available."}</p>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
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
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#02342e]">Additional Resources</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border border-[#d9d9d9]">
                      <CardContent className="flex items-center p-4">
                        <div className="mr-4 rounded-full bg-[#eaf4ed] p-2 text-[#095d40]">
                          <Download className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#2c2c2c]">Course Slides</h4>
                          <p className="text-sm text-[#9d968d]">PDF, 2.4 MB</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-[#d9d9d9]">
                      <CardContent className="flex items-center p-4">
                        <div className="mr-4 rounded-full bg-[#eaf4ed] p-2 text-[#095d40]">
                          <Download className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#2c2c2c]">Exercise Files</h4>
                          <p className="text-sm text-[#9d968d]">ZIP, 5.1 MB</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-[#d9d9d9]">
                      <CardContent className="flex items-center p-4">
                        <div className="mr-4 rounded-full bg-[#eaf4ed] p-2 text-[#095d40]">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#2c2c2c]">Reference Guide</h4>
                          <p className="text-sm text-[#9d968d]">PDF, 1.8 MB</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-[#d9d9d9]">
                      <CardContent className="flex items-center p-4">
                        <div className="mr-4 rounded-full bg-[#eaf4ed] p-2 text-[#095d40]">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#2c2c2c]">Additional Reading</h4>
                          <p className="text-sm text-[#9d968d]">External Link</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#02342e]">Discussion</h3>
                  <p className="text-[#9d968d]">Join the conversation about this content.</p>
                  <div className="rounded-lg border border-[#d9d9d9] bg-[#f5f5f5] p-6 text-center">
                    <p className="text-[#2c2c2c]">You need to be logged in to participate in discussions.</p>
                    <Button className="mt-4 bg-[#095d40] hover:bg-[#02342e]">Sign In to Comment</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-[#02342e]">Related Content</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video bg-[#e9f3f1]">
                      <Image
                        src={`/placeholder.svg?height=200&width=400&text=Related ${i + 1}`}
                        alt={`Related content ${i + 1}`}
                        width={400}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-[#02342e]">Related Content {i + 1}</h3>
                      <p className="mt-1 text-sm text-[#9d968d]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center">
          <div className="rounded-full bg-[#eaf4ed] p-4 text-[#095d40]">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-[#02342e]">Content Not Found</h3>
          <p className="mt-2 text-[#9d968d]">The content you are looking for does not exist or has been removed.</p>
          <Button className="mt-6 bg-[#095d40] hover:bg-[#02342e]" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}
