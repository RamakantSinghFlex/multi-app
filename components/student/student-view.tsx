"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Mail, Phone, School, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { User as UserType } from "@/lib/types"

interface StudentViewProps {
  studentId: string
  students: UserType[]
  userRole: string
  backPath: string
}

export function StudentView({ studentId, students, userRole, backPath }: StudentViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the student in the provided students array
    const foundStudent = students.find((s) => s.id === studentId)

    if (foundStudent) {
      setStudent(foundStudent)
    } else {
      toast({
        title: "Error",
        description: "Student not found",
        variant: "destructive",
      })
    }

    setLoading(false)
  }, [studentId, students, toast])

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push(backPath)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Student Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">The requested student could not be found.</p>
              <Button className="mt-4" onClick={() => router.push(backPath)}>
                Return to Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" onClick={() => router.push(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Student Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <User className="h-12 w-12" />
                </div>
                <CardTitle className="text-center">
                  {student.firstName} {student.lastName}
                </CardTitle>
                <CardDescription className="text-center">
                  <Badge variant="outline" className="mt-1">
                    {student.status || "Active"}
                  </Badge>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{student.email || "No email provided"}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{student.phone || "No phone provided"}</span>
                </div>
                <div className="flex items-center">
                  <School className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{student.school || "No school provided"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    {student.gradeLevel
                      ? student.gradeLevel.charAt(0).toUpperCase() + student.gradeLevel.slice(1) + " School"
                      : "No grade level provided"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`${backPath.replace(/\/$/, "")}/${student.id}/edit`)}
              >
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>Detailed information about the student</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Notes</h3>
                      <p className="text-sm text-muted-foreground mt-1">{student.notes || "No notes available"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">Tutors</h3>
                      <div className="mt-1">
                        {student.tutors && student.tutors.length > 0 ? (
                          <div className="space-y-2">
                            {student.tutors.map((tutor, index) => (
                              <div key={index} className="flex items-center">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                  <User className="h-3 w-3" />
                                </div>
                                <span className="text-sm">
                                  {typeof tutor === "object"
                                    ? `${tutor.firstName || ""} ${tutor.lastName || ""} (${tutor.email})`
                                    : tutor}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No tutors assigned</p>
                        )}
                      </div>
                    </div>

                    {userRole === "tutor" && (
                      <div>
                        <h3 className="text-sm font-medium">Parents</h3>
                        <div className="mt-1">
                          {student.parents && student.parents.length > 0 ? (
                            <div className="space-y-2">
                              {student.parents.map((parent, index) => (
                                <div key={index} className="flex items-center">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                    <User className="h-3 w-3" />
                                  </div>
                                  <span className="text-sm">
                                    {typeof parent === "object"
                                      ? `${parent.firstName || ""} ${parent.lastName || ""} (${parent.email})`
                                      : parent}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No parents assigned</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium">Account Created</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">Last Updated</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sessions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions History</CardTitle>
                  <CardDescription>Past and upcoming sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No sessions found</p>
                    <Button className="mt-4">Schedule a Session</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Student documents and materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No documents found</p>
                    <Button className="mt-4">Upload Document</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
