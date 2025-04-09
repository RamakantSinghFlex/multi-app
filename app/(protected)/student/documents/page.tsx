"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Search, Download, Upload, File, FileImage, FileArchive } from "lucide-react"

export default function StudentDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for demonstration
  const documents = [
    {
      id: 1,
      name: "Math Homework - Week 5.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadedBy: "John Smith",
      date: "2023-04-15",
    },
    {
      id: 2,
      name: "Chemistry Lab Report.docx",
      type: "docx",
      size: "1.8 MB",
      uploadedBy: "Sarah Johnson",
      date: "2023-04-10",
    },
    {
      id: 3,
      name: "English Essay Draft.docx",
      type: "docx",
      size: "950 KB",
      uploadedBy: "You",
      date: "2023-04-05",
    },
    {
      id: 4,
      name: "Physics Formulas.jpg",
      type: "jpg",
      size: "1.2 MB",
      uploadedBy: "Michael Brown",
      date: "2023-03-28",
    },
    {
      id: 5,
      name: "Study Resources.zip",
      type: "zip",
      size: "5.7 MB",
      uploadedBy: "Sarah Johnson",
      date: "2023-03-20",
    },
  ]

  const filteredDocuments = documents.filter(
    (document) =>
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "docx":
        return <File className="h-5 w-5 text-blue-500" />
      case "jpg":
      case "png":
        return <FileImage className="h-5 w-5 text-green-500" />
      case "zip":
        return <FileArchive className="h-5 w-5 text-yellow-500" />
      default:
        return <File className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Documents</h1>
          <p className="text-muted-foreground">Access and manage your documents</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          <TabsTrigger value="my">My Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>Documents shared by tutors and your uploads</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 border-b p-4 font-medium">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Uploaded By</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1">Size</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  <div className="divide-y">
                    {filteredDocuments.map((document) => (
                      <div key={document.id} className="grid grid-cols-12 gap-4 p-4">
                        <div className="col-span-5 flex items-center">
                          {getFileIcon(document.type)}
                          <span className="ml-2">{document.name}</span>
                        </div>
                        <div className="col-span-3">{document.uploadedBy}</div>
                        <div className="col-span-2">{new Date(document.date).toLocaleDateString()}</div>
                        <div className="col-span-1">{document.size}</div>
                        <div className="col-span-1">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p>No documents found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shared with Me</CardTitle>
              <CardDescription>Documents shared by your tutors</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDocuments.filter((d) => d.uploadedBy !== "You").length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 border-b p-4 font-medium">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Shared By</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1">Size</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  <div className="divide-y">
                    {filteredDocuments
                      .filter((d) => d.uploadedBy !== "You")
                      .map((document) => (
                        <div key={document.id} className="grid grid-cols-12 gap-4 p-4">
                          <div className="col-span-5 flex items-center">
                            {getFileIcon(document.type)}
                            <span className="ml-2">{document.name}</span>
                          </div>
                          <div className="col-span-3">{document.uploadedBy}</div>
                          <div className="col-span-2">{new Date(document.date).toLocaleDateString()}</div>
                          <div className="col-span-1">{document.size}</div>
                          <div className="col-span-1">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p>No shared documents found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Uploads</CardTitle>
              <CardDescription>Documents you've uploaded</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDocuments.filter((d) => d.uploadedBy === "You").length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 border-b p-4 font-medium">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-3">Date</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  <div className="divide-y">
                    {filteredDocuments
                      .filter((d) => d.uploadedBy === "You")
                      .map((document) => (
                        <div key={document.id} className="grid grid-cols-12 gap-4 p-4">
                          <div className="col-span-6 flex items-center">
                            {getFileIcon(document.type)}
                            <span className="ml-2">{document.name}</span>
                          </div>
                          <div className="col-span-3">{new Date(document.date).toLocaleDateString()}</div>
                          <div className="col-span-2">{document.size}</div>
                          <div className="col-span-1">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p>You haven't uploaded any documents yet.</p>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
