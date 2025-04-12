"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { Users, BookOpen, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ParentDashboardPage() {
  const { user } = useAuth()

  // Get data directly from the user object
  const sessions = user?.sessions || []
  const students = user?.students || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Parent Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName || "Parent"}!</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/parent/book">Book a Session</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/parent/appointments">View Appointments</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <h3 className="text-2xl font-bold">{sessions.length}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                <h3 className="text-2xl font-bold">
                  {sessions.filter((session) => new Date(session.startTime) > new Date()).length}
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students</p>
                <h3 className="text-2xl font-bold">{students.length}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                <h3 className="text-2xl font-bold">{new Set(sessions.map((session) => session.subject.name)).size}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.filter((session) => new Date(session.startTime) > new Date()).length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                      <div>Student</div>
                      <div>Tutor</div>
                      <div>Subject</div>
                      <div>Date & Time</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {sessions
                        .filter((session) => new Date(session.startTime) > new Date())
                        .map((session) => (
                          <div key={session.id} className="grid grid-cols-5 gap-4 p-4">
                            <div>
                              {typeof session.student === "object" ? session.student.firstName : session.student}
                            </div>
                            <div>{typeof session.tutor === "object" ? session.tutor.firstName : session.tutor}</div>
                            <div>{typeof session.subject === "object" ? session.subject.name : session.subject}</div>
                            <div>
                              {new Date(session.startTime).toLocaleDateString()}{" "}
                              {new Date(session.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/parent/sessions/${session.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href="/parent/sessions">View All Sessions</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-4">
                  <p>No upcoming sessions scheduled</p>
                  <Button asChild>
                    <Link href="/parent/book">Book a Session</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Sessions</CardTitle>
              <CardDescription>Your completed tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.filter((session) => new Date(session.startTime) <= new Date()).length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                      <div>Student</div>
                      <div>Tutor</div>
                      <div>Subject</div>
                      <div>Date & Time</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {sessions
                        .filter((session) => new Date(session.startTime) <= new Date())
                        .map((session) => (
                          <div key={session.id} className="grid grid-cols-5 gap-4 p-4">
                            <div>
                              {typeof session.student === "object" ? session.student.firstName : session.student}
                            </div>
                            <div>{typeof session.tutor === "object" ? session.tutor.firstName : session.tutor}</div>
                            <div>{typeof session.subject === "object" ? session.subject.name : session.subject}</div>
                            <div>
                              {new Date(session.startTime).toLocaleDateString()}{" "}
                              {new Date(session.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/parent/sessions/${session.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href="/parent/sessions">View All Sessions</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p>No past sessions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Students</CardTitle>
              <CardDescription>Manage your students' profiles</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                      <div>Name</div>
                      <div>Grade Level</div>
                      <div>Subjects</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {students.map((student) => (
                        <div key={student.id} className="grid grid-cols-4 gap-4 p-4">
                          <div>
                            {student.firstName} {student.lastName}
                          </div>
                          <div>{student.gradeLevel}</div>
                          <div>{student.subjects?.map((subject) => subject.name).join(", ") || "None specified"}</div>
                          <div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/parent/students/${student.id}`}>View Profile</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href="/parent/students">Manage Students</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-4">
                  <p>No students added yet</p>
                  <Button asChild>
                    <Link href="/parent/students/new">Add a Student</Link>
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
