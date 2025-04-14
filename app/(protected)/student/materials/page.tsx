"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Video, Search } from "lucide-react"

export default function StudentMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for demonstration
  const materials = [
    {
      id: 1,
      title: "Introduction to Algebra",
      type: "document",
      subject: "Mathematics",
      date: "2023-04-15",
    },
    {
      id: 2,
      title: "Chemistry Fundamentals",
      type: "video",
      subject: "Science",
      date: "2023-04-10",
    },
    {
      id: 3,
      title: "Essay Writing Guide",
      type: "document",
      subject: "English",
      date: "2023-04-05",
    },
    {
      id: 4,
      title: "Physics Problem Solving",
      type: "video",
      subject: "Science",
      date: "2023-03-28",
    },
  ]

  const filteredMaterials = materials.filter(
    (material) =>
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Learning Materials</h1>
          <p className="text-[#858585]">Access resources shared by your tutors</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#858585]" />
          <Input
            type="search"
            placeholder="Search materials..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Materials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <Card key={material.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{material.title}</CardTitle>
                      {material.type === "document" ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Video className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <CardDescription className="text-xs text-[#858585]">{material.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-[#858585]">Added on {new Date(material.date).toLocaleDateString()}</p>
                    <Button
                      variant="outline"
                      className="mt-4 w-full border-[#d9d9d9] text-[#000000] hover:bg-[#f4f4f4]"
                    >
                      View Material
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex h-40 flex-col items-center justify-center space-y-2">
                <BookOpen className="h-10 w-10 text-[#858585]" />
                <p className="text-[#858585]">No materials found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.filter((m) => m.type === "document").length > 0 ? (
              filteredMaterials
                .filter((m) => m.type === "document")
                .map((material) => (
                  <Card key={material.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{material.title}</CardTitle>
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardDescription className="text-xs text-[#858585]">{material.subject}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-[#858585]">Added on {new Date(material.date).toLocaleDateString()}</p>
                      <Button
                        variant="outline"
                        className="mt-4 w-full border-[#d9d9d9] text-[#000000] hover:bg-[#f4f4f4]"
                      >
                        View Document
                      </Button>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-full flex h-40 flex-col items-center justify-center space-y-2">
                <FileText className="h-10 w-10 text-[#858585]" />
                <p className="text-[#858585]">No documents found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.filter((m) => m.type === "video").length > 0 ? (
              filteredMaterials
                .filter((m) => m.type === "video")
                .map((material) => (
                  <Card key={material.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{material.title}</CardTitle>
                        <Video className="h-5 w-5 text-red-500" />
                      </div>
                      <CardDescription className="text-xs text-[#858585]">{material.subject}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-[#858585]">Added on {new Date(material.date).toLocaleDateString()}</p>
                      <Button
                        variant="outline"
                        className="mt-4 w-full border-[#d9d9d9] text-[#000000] hover:bg-[#f4f4f4]"
                      >
                        Watch Video
                      </Button>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-full flex h-40 flex-col items-center justify-center space-y-2">
                <Video className="h-10 w-10 text-[#858585]" />
                <p className="text-[#858585]">No videos found matching your search.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
