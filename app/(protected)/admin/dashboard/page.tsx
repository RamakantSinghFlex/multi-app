"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { Users, BookOpen, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { user } = useAuth()

  // Get stats directly from the user object
  const stats = {
    totalTutors: user?.tutors?.length || 0,
    totalParents: user?.parents?.length || 0,
    totalStudents: user?.students?.length || 0,
    revenue: 25000, // Mock data
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName || "Admin"}!</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <h3 className="text-2xl font-bold">{user?.appointments?.length || 0}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Total Tutors</p>
                <h3 className="text-2xl font-bold">{stats.totalTutors}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Parents</p>
                <h3 className="text-2xl font-bold">{stats.totalParents}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">{`${stats.revenue.toLocaleString()}`}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Appointments</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="tutors">Active Tutors</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Overview of recently completed tutoring appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                    <div>Student</div>
                    <div>Tutor</div>
                    <div>Subject</div>
                    <div>Date</div>
                    <div>Status</div>
                  </div>
                  <div className="divide-y">
                    {/* Mock data for demonstration */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="grid grid-cols-5 gap-4 p-4">
                        <div>Student {i}</div>
                        <div>Tutor {i}</div>
                        <div>Mathematics</div>
                        <div>{new Date().toLocaleDateString()}</div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/admin/appointments">View All Appointments</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Overview of scheduled tutoring appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                    <div>Student</div>
                    <div>Tutor</div>
                    <div>Subject</div>
                    <div>Date</div>
                    <div>Status</div>
                  </div>
                  <div className="divide-y">
                    {/* Mock data for demonstration */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="grid grid-cols-5 gap-4 p-4">
                        <div>Student {i + 3}</div>
                        <div>Tutor {i + 2}</div>
                        <div>Science</div>
                        <div>{new Date(Date.now() + 86400000 * i).toLocaleDateString()}</div>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Scheduled
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/admin/appointments">View All Appointments</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tutors</CardTitle>
              <CardDescription>Overview of currently active tutors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                    <div>Name</div>
                    <div>Subjects</div>
                    <div>Rating</div>
                    <div>Appointments</div>
                  </div>
                  <div className="divide-y">
                    {/* Mock data for demonstration */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="grid grid-cols-4 gap-4 p-4">
                        <div>Tutor {i}</div>
                        <div>Mathematics, Science</div>
                        <div>4.{9 - i}/5</div>
                        <div>{20 - i * 3}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/admin/tutors">View All Tutors</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
