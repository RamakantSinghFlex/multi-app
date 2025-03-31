"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCollections, getContentByCollection, type Collection, type Content } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { BookOpen, Clock, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardPage() {
  const { user } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [recentContent, setRecentContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const collectionsData = await getCollections()
        setCollections(collectionsData)

        if (collectionsData.length > 0) {
          const contentData = await getContentByCollection(collectionsData[0].slug, 1, 4)
          setRecentContent(contentData.docs)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[#02342e] md:text-3xl">Dashboard</h1>
          <p className="text-[#9d968d]">Welcome back, {user?.firstName || "User"}!</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-[#095d40] hover:bg-[#02342e]">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">Courses</p>
                <h3 className="text-2xl font-bold text-[#02342e]">12</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">In Progress</p>
                <h3 className="text-2xl font-bold text-[#02342e]">4</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">Completed</p>
                <h3 className="text-2xl font-bold text-[#02342e]">8</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#9d968d]">Certificates</p>
                <h3 className="text-2xl font-bold text-[#02342e]">3</h3>
              </div>
              <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="recent" className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]">
            Recent Content
          </TabsTrigger>
          <TabsTrigger
            value="recommended"
            className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]"
          >
            Recommended
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-[#eaf4ed] data-[state=active]:text-[#095d40]">
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <div className="h-40 animate-pulse bg-[#e8e8e8]" />
                    <CardContent className="p-4">
                      <div className="h-4 w-3/4 animate-pulse bg-[#e8e8e8]" />
                      <div className="mt-2 h-3 animate-pulse bg-[#e8e8e8]" />
                    </CardContent>
                  </Card>
                ))
            ) : recentContent.length > 0 ? (
              recentContent.map((content) => (
                <Link key={content.id} href={`/content/${content.id}`}>
                  <Card className="overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video bg-[#e9f3f1]">
                      <Image
                        src={content.thumbnail || "/placeholder.svg?height=200&width=400"}
                        alt={content.title}
                        width={400}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-[#02342e]">{content.title}</h3>
                      <p className="mt-1 text-sm text-[#9d968d]">
                        {content.description?.substring(0, 60) || "No description available"}
                        {content.description && content.description.length > 60 ? "..." : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
                <div className="rounded-full bg-[#eaf4ed] p-3 text-[#095d40]">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-[#02342e]">No content available</h3>
                <p className="mt-1 text-[#9d968d]">Start exploring our collections to find content</p>
                <Button className="mt-4 bg-[#095d40] hover:bg-[#02342e]">Browse Collections</Button>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-[#d9d9d9] text-[#095d40] hover:bg-[#eaf4ed] hover:text-[#095d40]"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="rounded-lg bg-white p-8 text-center">
            <h3 className="text-lg font-medium text-[#02342e]">Personalized Recommendations</h3>
            <p className="mt-2 text-[#9d968d]">
              Continue learning to get personalized recommendations based on your interests.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="popular">
          <div className="rounded-lg bg-white p-8 text-center">
            <h3 className="text-lg font-medium text-[#02342e]">Popular Content</h3>
            <p className="mt-2 text-[#9d968d]">Discover what other learners are finding valuable.</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#02342e]">Your Progress</CardTitle>
            <CardDescription className="text-[#9d968d]">Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-40 animate-pulse bg-[#e8e8e8]" />
                        <div className="h-4 w-10 animate-pulse bg-[#e8e8e8]" />
                      </div>
                      <div className="h-2 w-full animate-pulse rounded-full bg-[#e8e8e8]" />
                    </div>
                  ))
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2c2c2c]">Introduction to React</span>
                      <span className="text-xs text-[#9d968d]">75%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e8e8e8]">
                      <div className="h-2 w-3/4 rounded-full bg-[#095d40]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2c2c2c]">Advanced JavaScript</span>
                      <span className="text-xs text-[#9d968d]">45%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e8e8e8]">
                      <div className="h-2 w-2/5 rounded-full bg-[#095d40]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2c2c2c]">UI/UX Fundamentals</span>
                      <span className="text-xs text-[#9d968d]">90%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e8e8e8]">
                      <div className="h-2 w-[90%] rounded-full bg-[#095d40]" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-[#02342e]">Upcoming Events</CardTitle>
            <CardDescription className="text-[#9d968d]">Stay updated with scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex animate-pulse space-x-4">
                      <div className="h-12 w-12 rounded bg-[#e8e8e8]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-[#e8e8e8]" />
                        <div className="h-3 w-1/2 bg-[#e8e8e8]" />
                      </div>
                    </div>
                  ))
              ) : (
                <>
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-[#eaf4ed] text-[#095d40]">
                      <span className="text-xs font-medium">APR</span>
                      <span className="text-lg font-bold">15</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c2c2c]">Web Development Workshop</h4>
                      <p className="text-sm text-[#9d968d]">10:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-[#eaf4ed] text-[#095d40]">
                      <span className="text-xs font-medium">APR</span>
                      <span className="text-lg font-bold">22</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c2c2c]">Design Systems Webinar</h4>
                      <p className="text-sm text-[#9d968d]">2:00 PM - 3:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-[#eaf4ed] text-[#095d40]">
                      <span className="text-xs font-medium">MAY</span>
                      <span className="text-lg font-bold">05</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#2c2c2c]">Career Development Session</h4>
                      <p className="text-sm text-[#9d968d]">11:00 AM - 1:00 PM</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

