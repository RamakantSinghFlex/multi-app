"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Plus, MoreHorizontal, Columns, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ParentStudentsPage() {
  const { user } = useAuth()
  const router = useRouter() // Add router
  const [searchQuery, setSearchQuery] = useState("")
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState("updatedAt")
  const [sortDirection, setSortDirection] = useState("desc") // Default to newest first
  const [sortIndicator, setSortIndicator] = useState({ field: "updatedAt", direction: "desc" })

  // Get students directly from the user object and check for recently created students
  useEffect(() => {
    if (user) {
      // Extract students from the user object
      const studentsList = user.students || []

      // Check localStorage for recently created students
      try {
        const recentlyCreatedStudentsJson = localStorage.getItem("recentlyCreatedStudents")
        if (recentlyCreatedStudentsJson) {
          const recentlyCreatedStudents = JSON.parse(recentlyCreatedStudentsJson)

          // Add any recently created students that aren't already in the list
          if (Array.isArray(recentlyCreatedStudents) && recentlyCreatedStudents.length > 0) {
            const existingIds = new Set(studentsList.map((student) => student.id))

            recentlyCreatedStudents.forEach((newStudent) => {
              if (newStudent && newStudent.id && !existingIds.has(newStudent.id)) {
                studentsList.push(newStudent)
                existingIds.add(newStudent.id)
              }
            })
          }
        }
      } catch (err) {
        console.error("Error retrieving recently created students:", err)
      }

      // Sort students by the current sort field and direction
      const sortedStudents = sortStudentsByField(studentsList, sortField, sortDirection)
      setStudents(sortedStudents)
      setLoading(false)
    }
  }, [user, sortField, sortDirection])

  // Add a refresh function that can be called to force a refresh of the data
  const refreshStudentsList = () => {
    router.refresh()
  }

  // Function to sort students by a specific field
  const sortStudentsByField = (studentsArray, field, direction) => {
    return [...studentsArray].sort((a, b) => {
      // Handle missing values
      if (!a[field]) return direction === "asc" ? -1 : 1
      if (!b[field]) return direction === "asc" ? 1 : -1

      // For dates, convert to timestamps for comparison
      if (field === "updatedAt" || field === "createdAt") {
        const dateA = new Date(a[field]).getTime()
        const dateB = new Date(b[field]).getTime()
        return direction === "asc" ? dateA - dateB : dateB - dateA
      }

      // For strings
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return direction === "asc" ? a[field].localeCompare(b[field]) : b[field].localeCompare(a[field])
      }

      // For other types
      return direction === "asc" ? a[field] - b[field] : b[field] - a[field]
    })
  }

  // Function to handle sort changes
  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc"
      setSortDirection(newDirection)
      setSortIndicator({ field, direction: newDirection })
    } else {
      // If clicking a new field, set it and default to desc (newest/highest first)
      setSortField(field)
      setSortDirection("desc")
      setSortIndicator({ field, direction: "desc" })
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [students, searchQuery])

  // Function to render sort indicator
  const renderSortIndicator = (field) => {
    if (sortIndicator.field !== field) return null
    return <span className="ml-1 text-xs">{sortIndicator.direction === "asc" ? "↑" : "↓"}</span>
  }

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container py-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Students</h1>
            <p className="text-muted-foreground text-xs">Manage your children's profiles</p>
          </div>
          <Button asChild size="sm">
            <Link href="/parent/students/new">
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add New
            </Link>
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <Tabs defaultValue="students" className="w-full">
            <div className="flex justify-between items-center mb-2">
              <TabsList>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="group-tags">Group Tags</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-8 h-8 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <Columns className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Show All Columns</DropdownMenuItem>
                    <DropdownMenuItem>Student</DropdownMenuItem>
                    <DropdownMenuItem>Student Contact</DropdownMenuItem>
                    <DropdownMenuItem>Notes</DropdownMenuItem>
                    <DropdownMenuItem>Group Tags</DropdownMenuItem>
                    <DropdownMenuItem>Tutors</DropdownMenuItem>
                    <DropdownMenuItem>Next Lesson</DropdownMenuItem>
                    <DropdownMenuItem>Make-Up Credits</DropdownMenuItem>
                    <DropdownMenuItem>Age</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSort("firstName")}>Sort by Name (A-Z)</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("firstName")
                        setSortDirection("desc")
                        setSortIndicator({ field: "firstName", direction: "desc" })
                      }}
                    >
                      Sort by Name (Z-A)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("updatedAt")
                        setSortDirection("desc")
                        setSortIndicator({ field: "updatedAt", direction: "desc" })
                      }}
                    >
                      Sort by Last Updated (Newest)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("updatedAt")
                        setSortDirection("asc")
                        setSortIndicator({ field: "updatedAt", direction: "asc" })
                      }}
                    >
                      Sort by Last Updated (Oldest)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("createdAt")
                        setSortDirection("desc")
                        setSortIndicator({ field: "createdAt", direction: "desc" })
                      }}
                    >
                      Sort by Date Added (Newest)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSortField("createdAt")
                        setSortDirection("asc")
                        setSortIndicator({ field: "createdAt", direction: "asc" })
                      }}
                    >
                      Sort by Date Added (Oldest)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="students" className="mt-0">
              <Card className="border rounded-md">
                <div className="flex items-center px-3 py-1.5 border-b text-xs">
                  <Badge variant="outline" className="mr-2 text-xs py-0 h-5">
                    {filteredStudents.length} Active
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead
                        className="cursor-pointer h-8 text-xs font-medium"
                        onClick={() => handleSort("firstName")}
                      >
                        <div className="flex items-center">
                          Student
                          {renderSortIndicator("firstName")}
                        </div>
                      </TableHead>
                      <TableHead className="h-8 text-xs font-medium">Student Contact</TableHead>
                      <TableHead className="h-8 text-xs font-medium">Notes</TableHead>
                      <TableHead className="h-8 text-xs font-medium">Group Tags</TableHead>
                      <TableHead className="h-8 text-xs font-medium">Tutors</TableHead>
                      <TableHead className="h-8 text-xs font-medium">Next Lesson</TableHead>
                      <TableHead className="h-8 text-xs font-medium">Make-Up Credits</TableHead>
                      <TableHead
                        className="cursor-pointer h-8 text-xs font-medium"
                        onClick={() => handleSort("updatedAt")}
                      >
                        <div className="flex items-center">
                          Last Updated
                          {renderSortIndicator("updatedAt")}
                        </div>
                      </TableHead>
                      <TableHead className="w-10 h-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-4 text-sm">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} className="h-10 hover:bg-muted/30">
                          <TableCell className="py-1">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                {student.firstName?.charAt(0) || student.email?.charAt(0) || "S"}
                              </div>
                              <div>
                                <div className="font-medium text-xs">
                                  {student.firstName && student.lastName
                                    ? `${student.firstName} ${student.lastName}`
                                    : student.firstName || student.lastName || "Unnamed Student"}
                                </div>
                                <Badge variant="outline" className="text-[10px] mt-0.5 py-0 h-4">
                                  {student.status || "Active"}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-1 text-xs">{student.email || "-"}</TableCell>
                          <TableCell className="py-1 text-xs">-</TableCell>
                          <TableCell className="py-1 text-xs">-</TableCell>
                          <TableCell className="py-1 text-xs">
                            {student.tutors
                              ?.map((tutor) => (typeof tutor === "object" ? tutor.email : "-"))
                              .join(", ") || "-"}
                          </TableCell>
                          <TableCell className="py-1 text-xs">-</TableCell>
                          <TableCell className="py-1 text-xs">-</TableCell>
                          <TableCell className="py-1 text-xs">{formatDate(student.updatedAt)}</TableCell>
                          <TableCell className="py-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/parent/students/${student.id}`}>View Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/parent/students/${student.id}/edit`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Book Session</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between p-2 border-t text-xs">
                  <div className="text-muted-foreground">
                    Showing {filteredStudents.length} of {students.length} students
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="group-tags">
              <Card className="border rounded-md">
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground text-sm">No group tags created yet.</p>
                  <Button size="sm" className="mt-4">
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Create Group Tag
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
