import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TutorDashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-5">Tutor Dashboard</h1>
      <div className="flex flex-col space-y-4">
        {/* Add a link to appointments in the dashboard */}
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/tutor/appointments">View Appointments</Link>
          </Button>
        </div>
        {/* Add more dashboard content here */}
      </div>
    </div>
  )
}
