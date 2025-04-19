"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Search, UserPlus } from "lucide-react"
import Link from "next/link"
import { getStudents } from "@/lib/api/students"
import { useStudentList } from "@/hooks/use-student-list"

export default function TutorStudentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { students, setStudents, loading: studentsLoading } = useStudentList()

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.id) return

      try {
        const response = await getStudents({ tutor: user.id })
        if (response.error) {
          throw new Error(response.error)
        }
        if (response.data) {
          setStudents(response.data)
        }
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to load students. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [user?.id, toast, setStudents])

  const filteredStudents = students.filter(
    (student) =>
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeStudents = filteredStudents.filter((student) => student.status === "active")
  const inactiveStudents = filteredStudents.filter((student) => student.status !== "active")

  if (loading || studentsLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading students...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Students</h1>
          <p className="text-muted-foreground">Manage your students and their learning progress</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/tutor/students/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeStudents.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveStudents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeStudents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No active students</h3>
                <p className="text-muted-foreground mb-4">You don't have any active students yet.</p>
                <Link href="/tutor/students/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeStudents.map((student) => (
                <Link key={student.id} href={`/tutor/students/${student.id}`}>
                  <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{`${student.firstName} ${student.lastName}`}</CardTitle>
                      <CardDescription>{student.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {student.gradeLevel && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Grade Level:</span>
                            <span>{student.gradeLevel}</span>
                          </div>
                        )}
                        {student.school && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">School:</span>
                            <span>{student.school}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveStudents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No inactive students</h3>
                <p className="text-muted-foreground">You don't have any inactive students.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveStudents.map((student) => (
                <Link key={student.id} href={`/tutor/students/${student.id}`}>
                  <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{`${student.firstName} ${student.lastName}`}</CardTitle>
                      <CardDescription>{student.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {student.gradeLevel && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Grade Level:</span>
                            <span>{student.gradeLevel}</span>
                          </div>
                        )}
                        {student.school && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">School:</span>
                            <span>{student.school}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="text-yellow-600">{student.status}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
