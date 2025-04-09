"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { getSessions } from "@/lib/api"
import { Loader2, GraduationCap, TrendingUp, Award, BookOpen } from "lucide-react"

export default function StudentProgressPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const sessionsResponse = await getSessions(1, 100, { student: user?.id })
        if (sessionsResponse.data) {
          setSessions(sessionsResponse.data.docs)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  // Calculate subject progress
  const subjectProgress = sessions.reduce((acc: Record<string, { total: number; completed: number }>, session) => {
    const subjectName = session.subject?.name || "Unknown"

    if (!acc[subjectName]) {
      acc[subjectName] = { total: 0, completed: 0 }
    }

    acc[subjectName].total++

    if (session.status === "completed") {
      acc[subjectName].completed++
    }

    return acc
  }, {})

  // Calculate overall progress
  const overallProgress = {
    total: sessions.length,
    completed: sessions.filter((session) => session.status === "completed").length,
    percentage:
      sessions.length > 0
        ? Math.round((sessions.filter((session) => session.status === "completed").length / sessions.length) * 100)
        : 0,
  }

  // Mock data for achievements
  const achievements = [
    {
      id: 1,
      title: "First Session",
      description: "Completed your first tutoring session",
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      earned: true,
      date: "2023-03-15",
    },
    {
      id: 2,
      title: "Math Master",
      description: "Completed 5 mathematics sessions",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      earned: sessions.filter((s) => s.status === "completed" && s.subject?.name === "Mathematics").length >= 5,
      date:
        sessions.filter((s) => s.status === "completed" && s.subject?.name === "Mathematics").length >= 5
          ? "2023-04-10"
          : null,
    },
    {
      id: 3,
      title: "Dedicated Learner",
      description: "Completed 10 sessions total",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      earned: sessions.filter((s) => s.status === "completed").length >= 10,
      date: sessions.filter((s) => s.status === "completed").length >= 10 ? "2023-04-22" : null,
    },
    {
      id: 4,
      title: "Perfect Attendance",
      description: "Attended 5 consecutive sessions without cancellation",
      icon: <Award className="h-8 w-8 text-primary" />,
      earned: false,
      date: null,
    },
  ]

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading progress data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Progress Tracking</h1>
        <p className="text-muted-foreground">Monitor your learning journey and achievements</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <GraduationCap className="mb-2 h-8 w-8 text-primary" />
            <CardTitle className="text-xl">Overall Progress</CardTitle>
            <div className="mt-2 text-3xl font-bold">{overallProgress.percentage}%</div>
            <p className="text-sm text-muted-foreground">
              {overallProgress.completed} of {overallProgress.total} sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <BookOpen className="mb-2 h-8 w-8 text-primary" />
            <CardTitle className="text-xl">Subjects</CardTitle>
            <div className="mt-2 text-3xl font-bold">{Object.keys(subjectProgress).length}</div>
            <p className="text-sm text-muted-foreground">Different subjects studied</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <TrendingUp className="mb-2 h-8 w-8 text-primary" />
            <CardTitle className="text-xl">Sessions</CardTitle>
            <div className="mt-2 text-3xl font-bold">{sessions.length}</div>
            <p className="text-sm text-muted-foreground">Total tutoring sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Award className="mb-2 h-8 w-8 text-primary" />
            <CardTitle className="text-xl">Achievements</CardTitle>
            <div className="mt-2 text-3xl font-bold">{achievements.filter((a) => a.earned).length}</div>
            <p className="text-sm text-muted-foreground">
              {achievements.filter((a) => a.earned).length} of {achievements.length} earned
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Subject Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Track your progress across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(subjectProgress).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(subjectProgress).map(([subject, data]) => (
                    <div key={subject} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{subject}</h3>
                        <span className="text-sm text-muted-foreground">
                          {data.completed} of {data.total} sessions completed
                        </span>
                      </div>
                      <Progress value={(data.completed / data.total) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                  <p>No subject progress data available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Milestones and badges you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`overflow-hidden ${!achievement.earned ? "opacity-60" : ""}`}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="rounded-full bg-primary/10 p-2">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.earned ? (
                          <p className="mt-1 text-xs text-green-600">
                            Earned on {new Date(achievement.date!).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">Not yet earned</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
