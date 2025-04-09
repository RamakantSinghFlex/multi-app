"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getSessions } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format, parseISO, isAfter, isBefore } from "date-fns"
import { Calendar, Clock, User, AlertCircle, Loader2 } from "lucide-react"

export default function StudentSessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await getSessions(1, 100, { student: user.id })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        setSessions(response.data.docs)
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      setError(error instanceof Error ? error.message : "Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [user?.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Scheduled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      case "rescheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Rescheduled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter sessions by status
  const upcomingSessions = sessions.filter(
    (session) =>
      session.status !== "cancelled" &&
      session.status !== "completed" &&
      isAfter(parseISO(session.startTime), new Date()),
  )

  const pastSessions = sessions.filter(
    (session) => session.status === "completed" || isBefore(parseISO(session.startTime), new Date()),
  )

  const cancelledSessions = sessions.filter((session) => session.status === "cancelled")

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading sessions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Failed to load sessions</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchSessions}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Sessions</h1>
          <p className="text-muted-foreground">View your tutoring sessions</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No upcoming sessions</h3>
                <p className="text-muted-foreground mb-4">You don't have any upcoming sessions scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{session.subject?.name || "Tutoring Session"}</CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <CardDescription>{format(parseISO(session.startTime), "EEEE, MMMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {format(parseISO(session.startTime), "h:mm a")} -{" "}
                            {format(parseISO(session.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            Tutor: {session.tutor?.firstName} {session.tutor?.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/student/sessions/${session.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No past sessions</h3>
                <p className="text-muted-foreground">You don't have any past sessions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{session.subject?.name || "Tutoring Session"}</CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <CardDescription>{format(parseISO(session.startTime), "EEEE, MMMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {format(parseISO(session.startTime), "h:mm a")} -{" "}
                            {format(parseISO(session.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            Tutor: {session.tutor?.firstName} {session.tutor?.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/student/sessions/${session.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No cancelled sessions</h3>
                <p className="text-muted-foreground">You don't have any cancelled sessions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cancelledSessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{session.subject?.name || "Tutoring Session"}</CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <CardDescription>{format(parseISO(session.startTime), "EEEE, MMMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            {format(parseISO(session.startTime), "h:mm a")} -{" "}
                            {format(parseISO(session.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            Tutor: {session.tutor?.firstName} {session.tutor?.lastName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
