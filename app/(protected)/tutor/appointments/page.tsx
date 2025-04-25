"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getAppointments } from "@/lib/api/appointments"
import { useAuth } from "@/lib/auth-context"
import AppointmentCalendar from "@/components/appointment/appointment-calendar"
import { GoogleCalendarView } from "@/components/calendar/google-calendar-view"
import { AppointmentList } from "@/components/calendar/appointment-list"

export default function TutorAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return

      setLoading(true)
      try {
        const response = await getAppointments({
          tutors: user.id,
        })

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setAppointments(response.data)
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Appointments</h1>
          <p className="text-muted-foreground">View and manage your tutoring appointments</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogTitle>Schedule an Appointment</DialogTitle>
              <AppointmentCalendar
                onSuccess={() => {
                  setCreateDialogOpen(false)
                }}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <AppointmentList appointments={appointments} loading={loading} userRole="tutor" />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <GoogleCalendarView userRole="tutor" appointments={appointments} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
