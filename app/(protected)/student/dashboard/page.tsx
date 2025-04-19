"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react"

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("upcoming")

  // Get appointments directly from the user object instead of sessions
  const appointments = user?.appointments || []

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "completed" &&
      new Date(appointment.startTime) > new Date(),
  )

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "completed" || new Date(appointment.startTime) <= new Date(),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName || "Student"}!</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/student/appointments">View Appointments</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <h3 className="text-2xl font-bold">{appointments.length}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Upcoming Appointments</p>
                <h3 className="text-2xl font-bold">{upcomingAppointments.length}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Subjects</p>
                <h3 className="text-2xl font-bold">
                  {new Set(appointments.map((appointment) => appointment.subject?.name)).size}
                </h3>
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
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <h3 className="text-2xl font-bold">
                  {Math.round(
                    (appointments.filter((a) => a.status === "completed").length / Math.max(appointments.length, 1)) *
                      100,
                  )}
                  %
                </h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
          <TabsTrigger value="materials">Learning Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled tutoring appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                      <div>Tutor</div>
                      <div>Subject</div>
                      <div>Date & Time</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="grid grid-cols-4 gap-4 p-4">
                          <div>
                            {typeof appointment.tutor === "object"
                              ? `${appointment.tutor.firstName} ${appointment.tutor.lastName}`
                              : appointment.tutor}
                          </div>
                          <div>
                            {typeof appointment.subject === "object" ? appointment.subject.name : appointment.subject}
                          </div>
                          <div>
                            {new Date(appointment.startTime).toLocaleDateString()}{" "}
                            {new Date(appointment.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/student/appointments/${appointment.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href="/student/appointments">View All Appointments</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-4">
                  <p>No upcoming appointments scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>Your completed tutoring appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium">
                      <div>Tutor</div>
                      <div>Subject</div>
                      <div>Date & Time</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {pastAppointments.map((appointment) => (
                        <div key={appointment.id} className="grid grid-cols-4 gap-4 p-4">
                          <div>
                            {typeof appointment.tutor === "object"
                              ? `${appointment.tutor.firstName} ${appointment.tutor.lastName}`
                              : appointment.tutor}
                          </div>
                          <div>
                            {typeof appointment.subject === "object" ? appointment.subject.name : appointment.subject}
                          </div>
                          <div>
                            {new Date(appointment.startTime).toLocaleDateString()}{" "}
                            {new Date(appointment.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/student/appointments/${appointment.id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href="/student/appointments">View All Appointments</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p>No past appointments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Materials</CardTitle>
              <CardDescription>Resources shared by your tutors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 flex-col items-center justify-center space-y-4">
                <p>No learning materials available yet</p>
                <Button asChild>
                  <Link href="/student/materials">Browse Materials</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
